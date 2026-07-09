import { api } from '../lib/api'
import type { Product } from '../types/product'

type RawFavorite = Record<string, unknown>

function normalizeFavorite(data: unknown): Product | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const favorite = data as RawFavorite
  const product = (favorite.product ?? favorite.produto ?? favorite) as RawFavorite

  if (!product.id && !product.name && !product.nome) {
    return null
  }

  const now = new Date().toISOString()

  return {
    id: String(product.id ?? ''),
    ativo: Boolean(product.ativo ?? true),
    name: String(product.name ?? product.nome ?? ''),
    description: String(product.description ?? product.descricao ?? ''),
    price: Number(product.price ?? product.preco ?? 0),
    image: String(product.image ?? product.imagem ?? ''),
    categoria: String(product.categoria ?? 'FILAMENTOS'),
    estoque: Number(product.estoque ?? 0),
    status: String(product.status ?? 'DISPONIVEL') as Product['status'],
    createdAt: String(product.createdAt ?? now),
    updatedAt: String(product.updatedAt ?? now),
  }
}

function normalizeFavoritesResponse(data: unknown) {
  const values = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
      ? (data as Record<string, unknown>).favorites ??
        (data as Record<string, unknown>).favoritos ??
        (data as Record<string, unknown>).content ??
        (data as Record<string, unknown>).data
      : []

  return Array.isArray(values)
    ? values.flatMap((item) => {
        const favorite = normalizeFavorite(item)
        return favorite ? [favorite] : []
      })
    : []
}

export const favoriteService = {
  async list() {
    const { data } = await api.get('/favoritos')
    return normalizeFavoritesResponse(data)
  },

  async add(productId: string) {
    await api.post(`/favoritos/${encodeURIComponent(productId)}`)
  },

  async remove(productId: string) {
    await api.delete(`/favoritos/${encodeURIComponent(productId)}`)
  },
}
