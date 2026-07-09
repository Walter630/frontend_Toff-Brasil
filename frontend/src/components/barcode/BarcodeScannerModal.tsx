import { Camera, Keyboard, LoaderCircle, ScanLine, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type BarcodeScannerModalProps = {
  open: boolean
  onClose: () => void
  onScan: (code: string) => void
}

type DetectedBarcode = {
  rawValue: string
}

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[]
}) => {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

const barcodeFormats = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'itf',
  'qr_code',
]

export function BarcodeScannerModal({
  open,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stoppedRef = useRef(false)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    let frameId = 0
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    async function startScanner() {
      setStarting(true)
      setError('')
      stoppedRef.current = false

      if (!window.BarcodeDetector) {
        setError(
          'Este navegador nao suporta leitura automatica. Digite o codigo manualmente.',
        )
        setStarting(false)
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
          },
          audio: false,
        })
        const detector = new window.BarcodeDetector({
          formats: barcodeFormats,
        })

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        const scan = async () => {
          const video = videoRef.current

          if (!video || stoppedRef.current) {
            return
          }

          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && context) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            const [barcode] = await detector.detect(canvas)
            if (barcode?.rawValue) {
              onScan(barcode.rawValue)
              onClose()
              return
            }
          }

          frameId = window.requestAnimationFrame(() => {
            void scan()
          })
        }

        void scan()
      } catch {
        setError(
          'Nao foi possivel acessar a camera. Confira a permissao do navegador.',
        )
      } finally {
        setStarting(false)
      }
    }

    void startScanner()

    return () => {
      stoppedRef.current = true
      window.cancelAnimationFrame(frameId)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [onClose, onScan, open])

  if (!open) {
    return null
  }

  const submitManualCode = () => {
    const code = manualCode.trim()

    if (!code) {
      return
    }

    onScan(code)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] bg-brand-ink/70 p-4 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-lg items-center">
        <section className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-brand-orange">
                Scanner
              </p>
              <h2 className="text-lg font-bold text-brand-navy">
                Ler codigo de barras
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-xl bg-slate-100 text-brand-navy"
              aria-label="Fechar scanner"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="p-5">
            <div className="relative overflow-hidden rounded-2xl bg-brand-navy">
              <video
                ref={videoRef}
                muted
                playsInline
                className="aspect-[3/4] w-full object-cover sm:aspect-video"
              />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="h-28 w-64 max-w-[78%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(7,16,34,0.36)]" />
              </div>
              <div className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-brand-navy">
                {starting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ScanLine className="size-4 text-brand-orange" />
                )}
                Aponte para o codigo
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-brand-navy">
                {error}
              </p>
            )}

            <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-navy">
                <Keyboard className="size-4 text-brand-orange" />
                Codigo manual
              </div>
              <Input
                id="manual-barcode"
                label="Digite ou cole o codigo"
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                inputMode="numeric"
                placeholder="Ex.: 7891234567890"
              />
              <Button
                className="mt-3 w-full"
                onClick={submitManualCode}
                disabled={!manualCode.trim()}
              >
                <Camera className="size-4" />
                Usar codigo
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
