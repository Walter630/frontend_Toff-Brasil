import { products as seedProducts } from '../features/catalog/products'
import type { Product } from '../types/product'

const localProductsKey = 'toffco-local-products'
const localProductsVersionKey = 'toffco-local-products-version'
const localProductsVersion = '2026-07-06-masterprint-prices-v1'
export const localProductsEvent = 'toffco-local-products-change'
const seedProductsById = new Map(
  seedProducts.map((product) => [product.id, product]),
)

type ProductFilters = {
  name?: string
  description?: string
  price?: number
  categoria?: string
}

type ProductPayload = {
  name: string
  description: string
  image: string
  categoria: string
  price: number
  estoque: number
  status?: Product['status']
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function readProducts(): Product[] {
  if (typeof window === 'undefined') {
    return seedProducts
  }

  try {
    const storedValue = window.localStorage.getItem(localProductsKey)
    if (!storedValue) {
      persistProducts(seedProducts)
      return seedProducts
    }

    const storedProducts = JSON.parse(storedValue) as Product[]
    const storedVersion = window.localStorage.getItem(localProductsVersionKey)

    if (storedVersion !== localProductsVersion) {
      const syncedProducts = syncSeedProducts(storedProducts)
      persistProducts(syncedProducts)
      return syncedProducts
    }

    return storedProducts
  } catch {
    return seedProducts
  }
}

function persistProducts(products: Product[]) {
  window.localStorage.setItem(localProductsKey, JSON.stringify(products))
  window.localStorage.setItem(localProductsVersionKey, localProductsVersion)
}

function writeProducts(products: Product[]) {
  try {
    persistProducts(products)
    window.dispatchEvent(new Event(localProductsEvent))
  } catch {
    throw new Error(
      'Nao foi possivel salvar no banco local. O navegador pode estar sem espaco ou com armazenamento bloqueado.',
    )
  }
}

function syncSeedProducts(products: Product[]) {
  const storedIds = new Set(products.map((product) => product.id))
  const syncedProducts = products.map((product) => {
    const seedProduct = seedProductsById.get(product.id)

    if (!seedProduct) {
      return product
    }

    return {
      ...product,
      price: seedProduct.price,
      status: seedProduct.status,
      statusMessage: seedProduct.statusMessage,
    }
  })
  const missingSeedProducts = seedProducts.filter(
    (product) => !storedIds.has(product.id),
  )

  return [...syncedProducts, ...missingSeedProducts]
}

function createProductId(name: string) {
  const slug = normalizeText(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)

  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36)

  return `local-${slug || 'produto'}-${suffix}`
}

function matchesFilters(product: Product, filters: ProductFilters = {}) {
  const name = normalizeText(filters.name ?? '')
  const description = normalizeText(filters.description ?? '')
  const searchableText = normalizeText(`${product.name} ${product.description}`)
  const matchesCategory =
    !filters.categoria || product.categoria === filters.categoria
  const matchesName = !name || searchableText.includes(name)
  const matchesDescription =
    !description || normalizeText(product.description).includes(description)
  const matchesPrice = !filters.price || product.price === filters.price

  return (
    product.ativo &&
    matchesCategory &&
    matchesName &&
    matchesDescription &&
    matchesPrice
  )
}

export function listLocalProducts(filters: ProductFilters = {}) {
  return readProducts().filter((product) => matchesFilters(product, filters))
}

export function findLocalProductById(id: string) {
  const product = readProducts().find((item) => item.id === id && item.ativo)

  if (!product) {
    throw new Error('Produto nao encontrado.')
  }

  return product
}

export function createLocalProduct(payload: ProductPayload) {
  const now = new Date().toISOString()
  const product: Product = {
    id: createProductId(payload.name),
    ativo: true,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    image: payload.image,
    categoria: payload.categoria,
    estoque: payload.estoque,
    status: payload.status,
    createdAt: now,
    updatedAt: now,
  }

  writeProducts([product, ...readProducts()])
  return product
}

export function updateLocalProduct(id: string, payload: ProductPayload) {
  const products = readProducts()
  const productIndex = products.findIndex((product) => product.id === id)

  if (productIndex === -1) {
    throw new Error('Produto nao encontrado.')
  }

  const updatedProduct: Product = {
    ...products[productIndex],
    name: payload.name,
    description: payload.description,
    price: payload.price,
    image: payload.image,
    categoria: payload.categoria,
    estoque: payload.estoque,
    status: payload.status,
    updatedAt: new Date().toISOString(),
  }

  products[productIndex] = updatedProduct
  writeProducts(products)
  return updatedProduct
}

export function deleteLocalProduct(id: string) {
  const products = readProducts()
  const nextProducts = products.filter((product) => product.id !== id)

  if (nextProducts.length === products.length) {
    throw new Error('Produto nao encontrado.')
  }

  writeProducts(nextProducts)
}
