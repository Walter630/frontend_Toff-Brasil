const maxImageFileBytes = 8 * 1024 * 1024
const targetImageBytes = 420 * 1024
const maxImageDimension = 1200
const imageQualities = [0.76, 0.68, 0.6, 0.52, 0.44]

export type CompressedImage = {
  dataUrl: string
  blob: Blob
  fileName: string
  size: number
  originalSize: number
  width: number
  height: number
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export async function compressProductImage(
  file: File,
): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem.')
  }

  if (file.size > maxImageFileBytes) {
    throw new Error('A imagem precisa ter ate 8 MB.')
  }

  const source = await loadImage(file)
  const sourceWidth = getImageWidth(source)
  const sourceHeight = getImageHeight(source)
  const scale = Math.min(
    1,
    maxImageDimension / Math.max(sourceWidth, sourceHeight),
  )
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    closeImageSource(source)
    throw new Error('Nao foi possivel processar a imagem neste navegador.')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(source, 0, 0, width, height)
  closeImageSource(source)

  let compressedBlob: Blob | null = null

  let outputType = 'image/webp'

  for (const quality of imageQualities) {
    compressedBlob = await tryCanvasToBlob(canvas, outputType, quality)

    if (!compressedBlob && outputType === 'image/webp') {
      outputType = 'image/jpeg'
      compressedBlob = await tryCanvasToBlob(canvas, outputType, quality)
    }

    if (compressedBlob && compressedBlob.size <= targetImageBytes) {
      break
    }
  }

  const finalBlob =
    compressedBlob ??
    (await canvasToBlob(canvas, 'image/jpeg', imageQualities[0]))

  return {
    dataUrl: await blobToDataUrl(finalBlob),
    blob: finalBlob,
    fileName: getOptimizedFileName(file.name, finalBlob.type),
    size: finalBlob.size,
    originalSize: file.size,
    width,
    height,
  }
}

async function loadImage(file: File): Promise<HTMLImageElement | ImageBitmap> {
  if ('createImageBitmap' in window) {
    return window.createImageBitmap(file)
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Nao foi possivel abrir a imagem.'))
    }
    image.src = objectUrl
  })
}

function getImageWidth(source: HTMLImageElement | ImageBitmap) {
  return 'naturalWidth' in source ? source.naturalWidth : source.width
}

function getImageHeight(source: HTMLImageElement | ImageBitmap) {
  return 'naturalHeight' in source ? source.naturalHeight : source.height
}

function closeImageSource(source: HTMLImageElement | ImageBitmap) {
  if ('close' in source) {
    source.close()
  }
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error('Nao foi possivel compactar a imagem.'))
      },
      type,
      quality,
    )
  })
}

async function tryCanvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'))
    reader.readAsDataURL(blob)
  })
}

function getOptimizedFileName(fileName: string, mimeType: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim() || 'produto'
  const extension = mimeType === 'image/webp' ? 'webp' : 'jpg'

  return `${baseName}-otimizado.${extension}`
}
