import { api } from '../lib/api'
import type { CartItemResponse, CartResponse } from '../types/cart'

type RawCart = Record<string, unknown>

function getCartItems(data: RawCart): CartItemResponse[] {
  const items = data.items ?? data.itens ?? data.cartItems ?? data.carrinhoItens
  return Array.isArray(items) ? (items as CartItemResponse[]) : []
}

function getCartTotal(data: RawCart) {
  const total = data.valorTotal ?? data.total ?? data.totalValue
  const parsedTotal = Number(total)

  return Number.isFinite(parsedTotal) ? parsedTotal : 0
}

function getItemQuantity(item: unknown) {
  const cartItem = item as Record<string, unknown>
  const quantity = Number(cartItem.quantity ?? cartItem.quantidade ?? 1)

  return Number.isFinite(quantity) ? quantity : 1
}

function getItemUnitPrice(item: unknown) {
  const cartItem = item as Record<string, unknown>
  const product = (cartItem.product ?? cartItem.produto ?? {}) as Record<
    string,
    unknown
  >
  const price = Number(
    cartItem.unitPrice ??
      cartItem.precoUnitario ??
      cartItem.price ??
      product.price ??
      product.preco ??
      0,
  )

  return Number.isFinite(price) ? price : 0
}

function getItemsTotal(items: unknown[]) {
  return items.reduce<number>(
    (total, item) => total + getItemUnitPrice(item) * getItemQuantity(item),
    0,
  )
}

function normalizeCart(data: unknown): CartResponse {
  if (!data || typeof data !== 'object') {
    return { id: '', items: [], valorTotal: 0 }
  }

  const cart = data as RawCart
  const items = getCartItems(cart)
  const backendTotal = getCartTotal(cart)

  return {
    id: String(cart.id ?? ''),
    items,
    valorTotal: backendTotal > 0 ? backendTotal : getItemsTotal(items),
  }
}

export const cartService = {
  async getMyCart() {
    const { data } = await api.get('/carrinhos')
    return normalizeCart(data)
  },

  async addItem(productId: string, quantity = 1) {
    const { data } = await api.post(
      `/carrinhos/item/${encodeURIComponent(productId)}`,
      undefined,
      {
        params: { quantidade: quantity },
      },
    )

    return normalizeCart(data)
  },

  async removeItem(itemId: string) {
    await api.delete(`/carrinhos/item/${encodeURIComponent(itemId)}`)
  },

  async updateItemQuantity(productId: string, quantity: number) {
    const { data } = await api.put(
      `/carrinhos/item/${encodeURIComponent(productId)}`,
      undefined,
      {
        params: { quantidade: quantity },
      },
    )

    return normalizeCart(data)
  },
}
