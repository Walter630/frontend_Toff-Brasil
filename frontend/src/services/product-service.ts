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
  codigoBarras?: string
}

export const productCategories = ['FILAMENTOS', 'PECAS', 'IMPRESSORAS'] as const

export type ProductCreatePayload = {
  name: string
  description: string
  image: string
  categoria: (typeof productCategories)[number]
  price: number
  estoque: number
  codigoBarras?: string
  status?: Product['status']
}

export type ProductUpdatePayload = ProductCreatePayload

export const productCategoryOptions = [
  { label: 'Filamentos', value: 'FILAMENTOS' },
  { label: 'Pecas e acessorios', value: 'PECAS' },
  { label: 'Impressoras', value: 'IMPRESSORAS' },
] as const

const shouldUseBackendProducts = import.meta.env.VITE_PRODUCTS_SOURCE === 'api'

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
    image.startsWith('data:') ||
    image.startsWith('/')
  ) {
    return image
  }

  const assetUrl = import.meta.env.VITE_API_ASSET_URL as string | undefined
  return assetUrl ? `${assetUrl.replace(/\/$/, '')}/${image}` : image
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
    categoria: asString(product.categoria ?? product.category, 'FILAMENTOS'),
    marca: asString(product.marca ?? product.brand) || undefined,
    brand: asString(product.brand ?? product.marca) || undefined,
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
    return data.map((product) => normalizeProduct(product as RawProduct))
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  const response = data as Record<string, unknown>
  const products =
    response.products ?? response.content ?? response.items ?? response.data

  return Array.isArray(products)
    ? products.map((product) => normalizeProduct(product as RawProduct))
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
  const { data } = await api.get('/produtos', {
    params: createProductParams(filters),
  })

  return normalizeProductsResponse(data)
}

async function createBackendProduct(payload: ProductCreatePayload) {
  const { data } = await api.post('/produtos', payload)
  return normalizeProduct(data as RawProduct)
}

async function updateBackendProduct(id: string, payload: ProductUpdatePayload) {
  const { data } = await api.put(`/produtos/${encodeURIComponent(id)}`, payload)
  return normalizeProduct(data as RawProduct)
}

async function deleteBackendProduct(id: string) {
  await api.delete(`/produtos/${encodeURIComponent(id)}`)
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
  list: listCatalogProducts,
  create: createCatalogProduct,
  update: updateCatalogProduct,
  delete: deleteCatalogProduct,
  findById: findCatalogProductById,
}
