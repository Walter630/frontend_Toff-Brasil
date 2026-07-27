import type { CartResponse } from '../types/cart'

export const cartUpdatedEvent = 'toffbr:cart-updated'

export type CartUpdatedDetail = {
  cart?: CartResponse
  addedProductName?: string
}

export function getCartUnitCount(cart: CartResponse) {
  return cart.items.reduce(
    (total, item) => total + (item.quantity ?? item.quantidade ?? 1),
    0,
  )
}

export function notifyCartUpdated(detail: CartUpdatedDetail = {}) {
  window.dispatchEvent(
    new CustomEvent<CartUpdatedDetail>(cartUpdatedEvent, { detail }),
  )
}
