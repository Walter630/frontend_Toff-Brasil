import { api } from '../lib/api'
import type { CartResponse } from '../types/cart'

/** Encapsula as três rotas de carrinho existentes no backend. */
export const cartService = {
  async getMyCart() {
    const { data } = await api.get<CartResponse>('/carrinhos')
    return data
  },

  async addItem(productId: string, quantity = 1) {
    const { data } = await api.post<CartResponse>(
      `/carrinhos/item/${productId}`,
      undefined,
      {
        params: { quantidade: quantity },
      },
    )

    return data
  },

  async removeItem(itemId: string) {
    await api.delete(`/carrinhos/item/${itemId}`)
  },
}
