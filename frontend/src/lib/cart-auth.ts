const PENDING_CART_PRODUCT_KEY = 'toffbr:pending-cart-product-id'
const PENDING_CART_QUANTITY_KEY = 'toffbr:pending-cart-product-quantity'

export function savePendingCartProduct(productId: string, quantity = 1) {
  sessionStorage.setItem(PENDING_CART_PRODUCT_KEY, productId)
  sessionStorage.setItem(
    PENDING_CART_QUANTITY_KEY,
    String(Math.max(1, Math.floor(quantity))),
  )
}

export function consumePendingCartProduct() {
  const productId = sessionStorage.getItem(PENDING_CART_PRODUCT_KEY)

  if (productId) {
    sessionStorage.removeItem(PENDING_CART_PRODUCT_KEY)
  }

  return productId
}

export function consumePendingCartQuantity() {
  const savedQuantity = Number(
    sessionStorage.getItem(PENDING_CART_QUANTITY_KEY) ?? 1,
  )
  sessionStorage.removeItem(PENDING_CART_QUANTITY_KEY)

  return Number.isFinite(savedQuantity) && savedQuantity > 0
    ? Math.floor(savedQuantity)
    : 1
}
