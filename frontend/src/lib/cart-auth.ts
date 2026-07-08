const PENDING_CART_PRODUCT_KEY = 'toffbr:pending-cart-product-id'

export function savePendingCartProduct(productId: string) {
  sessionStorage.setItem(PENDING_CART_PRODUCT_KEY, productId)
}

export function consumePendingCartProduct() {
  const productId = sessionStorage.getItem(PENDING_CART_PRODUCT_KEY)

  if (productId) {
    sessionStorage.removeItem(PENDING_CART_PRODUCT_KEY)
  }

  return productId
}
