import { api } from '../lib/api'
import {
  createLocalProduct,
  deleteLocalProduct,
  findLocalProductById,
  listLocalProducts,
  updateLocalProduct,
} from '../lib/local-product-db'
import {
  canUseSharedProducts,
  createSharedProduct,
  deleteSharedProduct,
  listSharedProducts,
  updateSharedProduct,
} from '../lib/shared-product-db'
import type { Product } from '../types/product'

type ProductFilters = {
  name?: string
  description?: string
  price?: number
  categoria?: string
  marca?: string
  type?: string
  codigoBarras?: string
}

export const productCategories = ['FILAMENTOS', 'PECAS', 'IMPRESSORAS'] as const

export type ProductCreatePayload = {
  name: string
  description: string
  image: string
  images?: string[]
  featured?: boolean
  categoria: (typeof productCategories)[number]
  marca?: string
  type?: string
  price: number
  estoque: number
  codigoBarras?: string
  status?: Product['status']
}

export type ProductUpdatePayload = ProductCreatePayload

export type ProductImageUpload = {
  blob: Blob
  fileName: string
}

export const productCategoryOptions = [
  { label: 'Filamentos', value: 'FILAMENTOS' },
  { label: 'Pecas e acessorios', value: 'PECAS' },
  { label: 'Impressoras', value: 'IMPRESSORAS' },
] as const

const shouldUseBackendProducts = import.meta.env.VITE_PRODUCTS_SOURCE === 'api'
const productCacheDuration = 60_000
let backendProductCache:
  | {
      products: Product[]
      expiresAt: number
    }
  | undefined
let backendProductRequest: Promise<Product[]> | undefined

type RawProduct = Record<string, unknown>

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function normalizeImageUrl(image: string) {
  if (
    !image ||
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image
  }

  const assetUrl = import.meta.env.VITE_API_ASSET_URL as string | undefined

  if (image.startsWith('/uploads/')) {
    return assetUrl ? `${assetUrl.replace(/\/$/, '')}${image}` : image
  }

  if (image.startsWith('/')) {
    return image
  }

  return assetUrl ? `${assetUrl.replace(/\/$/, '')}/${image}` : image
}

function normalizeProductImages(value: unknown) {
  if (!Array.isArray(value)) return undefined

  const images = value
    .filter((image): image is string => typeof image === 'string' && Boolean(image))
    .map(normalizeImageUrl)

  return images.length ? images : undefined
}

function normalizeProduct(product: RawProduct): Product {
  const now = new Date().toISOString()
  const id = asString(product.id ?? product.uuid ?? product.codigo)

  return {
    id,
    ativo: Boolean(product.ativo ?? product.active ?? true),
    name: asString(product.name ?? product.nome),
    description: asString(product.description ?? product.descricao),
    price: asNumber(product.price ?? product.preco),
    image: normalizeImageUrl(asString(product.image ?? product.imagem)),
    images: normalizeProductImages(
      product.images ?? product.imagens ?? product.gallery,
    ),
    featured: Boolean(
      product.featured ?? product.destaque ?? product.emDestaque ?? false,
    ),
    categoria: asString(product.categoria ?? product.category, 'FILAMENTOS'),
    marca: asString(product.marca ?? product.brand) || undefined,
    brand: asString(product.brand ?? product.marca) || undefined,
    type: asString(product.type ?? product.tipo) || undefined,
    estoque: asNumber(product.estoque ?? product.stock),
    status: asString(product.status, 'DISPONIVEL') as Product['status'],
    availableAt:
      asString(product.availableAt ?? product.disponivelEm) || undefined,
    statusMessage:
      asString(product.statusMessage ?? product.mensagemStatus) || undefined,
    codigoBarras:
      asString(product.codigoBarras ?? product.barcode ?? product.ean) ||
      undefined,
    barcode:
      asString(product.barcode ?? product.codigoBarras ?? product.ean) ||
      undefined,
    createdAt: asString(product.createdAt ?? product.criadoEm, now),
    updatedAt: asString(product.updatedAt ?? product.atualizadoEm, now),
  }
}

function normalizeProductsResponse(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data
      .map((product) => normalizeProduct(product as RawProduct))
      .filter((product) => product.ativo)
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  const response = data as Record<string, unknown>
  const products =
    response.products ?? response.content ?? response.items ?? response.data

  return Array.isArray(products)
    ? products
        .map((product) => normalizeProduct(product as RawProduct))
        .filter((product) => product.ativo)
    : []
}

function createProductParams(filters: ProductFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  )
}

async function listBackendProducts(filters: ProductFilters = {}) {
  const hasFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '',
  )

  if (
    !hasFilters &&
    backendProductCache &&
    backendProductCache.expiresAt > Date.now()
  ) {
    return backendProductCache.products
  }

  if (!hasFilters && backendProductRequest) {
    return backendProductRequest
  }

  const request = api
    .get('/produtos', { params: createProductParams(filters) })
    .then(({ data }) => normalizeProductsResponse(data))

  if (hasFilters) {
    return request
  }

  backendProductRequest = request

  try {
    const products = await request
    backendProductCache = {
      products,
      expiresAt: Date.now() + productCacheDuration,
    }
    return products
  } finally {
    backendProductRequest = undefined
  }
}

function clearBackendProductCache() {
  backendProductCache = undefined
  backendProductRequest = undefined
}

async function createBackendProduct(payload: ProductCreatePayload) {
  const { data } = await api.post('/produtos/create', {
    ...payload,
    status: payload.status === 'EM_PRODUCAO' ? 'EM_PRODUÇAO' : payload.status,
  })
  clearBackendProductCache()
  return normalizeProduct(data as RawProduct)
}

async function updateBackendProduct(id: string, payload: ProductUpdatePayload) {
  const { data } = await api.put(`/produtos/${encodeURIComponent(id)}`, payload)
  clearBackendProductCache()
  return normalizeProduct(data as RawProduct)
}

async function uploadBackendProductImage(image: ProductImageUpload) {
  const formData = new FormData()
  formData.set('image', image.blob, image.fileName)

  const { data } = await api.post('/produtos/upload', formData)
  const response = data as Record<string, unknown>
  const imageUrl = asString(response.url ?? response.image ?? response.path)

  if (!imageUrl) {
    throw new Error('O upload nao retornou a URL da imagem.')
  }

  return imageUrl
}

async function deleteBackendProduct(id: string) {
  await api.delete(`/produtos/${encodeURIComponent(id)}`)
  clearBackendProductCache()
}

async function findBackendProductById(id: string) {
  const { data } = await api.get(`/produtos/${encodeURIComponent(id)}`)
  return normalizeProduct(data as RawProduct)
}

function requireConfiguredProductDatabase(): never {
  throw new Error(
    'Banco central de produtos nao configurado. Publique o arquivo products-api.php junto com o site.',
  )
}

async function listCatalogProducts(filters: ProductFilters = {}) {
  if (shouldUseBackendProducts) {
    return listBackendProducts(filters)
  }

  if (canUseSharedProducts()) {
    return listSharedProducts(filters)
  }

  if (import.meta.env.DEV) {
    return listLocalProducts(filters)
  }

  return requireConfiguredProductDatabase()
}

async function createCatalogProduct(payload: ProductCreatePayload) {
  if (shouldUseBackendProducts) {
    return createBackendProduct(payload)
  }

  if (canUseSharedProducts()) {
    return createSharedProduct(payload)
  }

  if (import.meta.env.DEV) {
    return createLocalProduct(payload)
  }

  return requireConfiguredProductDatabase()
}

async function updateCatalogProduct(id: string, payload: ProductUpdatePayload) {
  if (shouldUseBackendProducts) {
    return updateBackendProduct(id, payload)
  }

  if (canUseSharedProducts()) {
    return updateSharedProduct(id, payload)
  }

  if (import.meta.env.DEV) {
    return updateLocalProduct(id, payload)
  }

  return requireConfiguredProductDatabase()
}

async function deleteCatalogProduct(id: string) {
  if (shouldUseBackendProducts) {
    await deleteBackendProduct(id)
    return
  }

  if (canUseSharedProducts()) {
    await deleteSharedProduct(id)
    return
  }

  if (import.meta.env.DEV) {
    deleteLocalProduct(id)
    return
  }

  requireConfiguredProductDatabase()
}

async function findCatalogProductById(id: string) {
  if (shouldUseBackendProducts) {
    return findBackendProductById(id)
  }

  const product = (await listCatalogProducts()).find((item) => item.id === id)

  if (product) {
    return product
  }

  if (import.meta.env.DEV) {
    return findLocalProductById(id)
  }

  throw new Error('Produto nao encontrado no banco central.')
}

export const productService = {
  uploadImage: uploadBackendProductImage,
  list: listCatalogProducts,
  create: createCatalogProduct,
  update: updateCatalogProduct,
  delete: deleteCatalogProduct,
  findById: findCatalogProductById,
}
