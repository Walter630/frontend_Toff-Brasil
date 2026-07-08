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
}

export const productCategories = ['FILAMENTOS', 'PECAS', 'IMPRESSORAS'] as const

export type ProductCreatePayload = {
  name: string
  description: string
  image: string
  categoria: (typeof productCategories)[number]
  price: number
  estoque: number
  status?: Product['status']
}

export type ProductUpdatePayload = ProductCreatePayload

export const productCategoryOptions = [
  { label: 'Filamentos', value: 'FILAMENTOS' },
  { label: 'Pecas e acessorios', value: 'PECAS' },
  { label: 'Impressoras', value: 'IMPRESSORAS' },
] as const

function requireConfiguredProductDatabase(): never {
  throw new Error(
    'Banco central de produtos nao configurado. Publique o arquivo products-api.php junto com o site.',
  )
}

async function listCatalogProducts(filters: ProductFilters = {}) {
  if (canUseSharedProducts()) {
    return listSharedProducts(filters)
  }

  if (import.meta.env.DEV) {
    return listLocalProducts(filters)
  }

  return requireConfiguredProductDatabase()
}

async function createCatalogProduct(payload: ProductCreatePayload) {
  if (canUseSharedProducts()) {
    return createSharedProduct(payload)
  }

  if (import.meta.env.DEV) {
    return createLocalProduct(payload)
  }

  return requireConfiguredProductDatabase()
}

async function updateCatalogProduct(id: string, payload: ProductUpdatePayload) {
  if (canUseSharedProducts()) {
    return updateSharedProduct(id, payload)
  }

  if (import.meta.env.DEV) {
    return updateLocalProduct(id, payload)
  }

  return requireConfiguredProductDatabase()
}

async function deleteCatalogProduct(id: string) {
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
