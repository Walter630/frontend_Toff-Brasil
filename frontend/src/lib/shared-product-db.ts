import type { Product } from '../types/product'

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
  images?: string[]
  featured?: boolean
  categoria: string
  marca?: string
  type?: string
  price: number
  estoque: number
  status?: Product['status']
}

type ProductsResponse = {
  initialized: boolean
  products: Product[]
}

type SharedLoginResponse = {
  token: string
  refreshToken: string
  user: {
    email: string
    name: string
    role: 'MANAGER'
  }
}

function getSharedProductsApiUrl() {
  const configuredUrl = import.meta.env.VITE_SHARED_PRODUCTS_API_URL as
    | string
    | undefined

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '')
  }

  if (
    import.meta.env.VITE_PRODUCTS_SOURCE === 'api' ||
    import.meta.env.VITE_AUTH_SOURCE === 'api'
  ) {
    return null
  }

  if (typeof window === 'undefined') {
    return null
  }

  const { hostname, protocol } = window.location
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)

  if (!isLocalHost || protocol !== 'http:') {
    return `${window.location.origin}/products-api.php`
  }

  return `http://${hostname}:8787`
}

function createSharedProductsUrl(baseUrl: string, path: string) {
  if (baseUrl.endsWith('.php')) {
    const url = new URL(baseUrl, window.location.origin)
    url.searchParams.set('route', path)
    return url.toString()
  }

  return `${baseUrl}${path}`
}

function getCatalogManagerToken() {
  if (typeof window === 'undefined') {
    return null
  }

  const token =
    window.localStorage.getItem('toffbr:token') ??
    window.sessionStorage.getItem('toffbr:token')

  return token?.startsWith('catalog.') ? token : null
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
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

async function requestSharedProducts<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = getSharedProductsApiUrl()

  if (!baseUrl) {
    throw new Error('Banco central de produtos nao configurado.')
  }

  const token = getCatalogManagerToken()
  const headers = new Headers(init.headers)

  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(createSharedProductsUrl(baseUrl, path), {
    ...init,
    headers,
  })

  const data = (await response.json()) as { message?: string }

  if (!response.ok) {
    throw new Error(data.message ?? 'Falha no banco central de produtos.')
  }

  return data as T
}

export async function listSharedProducts(filters: ProductFilters = {}) {
  const data = await requestSharedProducts<ProductsResponse>('/products')
  const products = data.initialized ? data.products : []

  return products.filter((product) => matchesFilters(product, filters))
}

export async function createSharedProduct(payload: ProductPayload) {
  return requestSharedProducts<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSharedProduct(id: string, payload: ProductPayload) {
  return requestSharedProducts<Product>(`/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteSharedProduct(id: string) {
  await requestSharedProducts<{ ok: true }>(
    `/products/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  )
}

export async function loginSharedCatalogManager(
  email: string,
  password: string,
) {
  return requestSharedProducts<SharedLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function canUseSharedProducts() {
  return Boolean(getSharedProductsApiUrl())
}
