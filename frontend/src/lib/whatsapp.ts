import type { CartItemResponse, CartResponse } from '../types/cart'
import type { Product } from '../types/product'

const managerWhatsapp = import.meta.env.VITE_MANAGER_WHATSAPP?.replace(/\D/g, '')

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function getProductWhatsappUrl(product: Product) {
  const message = [
    `Ola, tenho interesse neste item da Toff Brasil: ${product.name}.`,
    `Categoria: ${product.categoria}.`,
    'Quantidade solicitada: 1 unidade.',
    `Preco: ${currency.format(product.price)}.`,
  ].join(' ')

  const contactPath = managerWhatsapp ? `/${managerWhatsapp}` : '/'

  return `https://wa.me${contactPath}?text=${encodeURIComponent(message)}`
}

function getCartItemName(item: CartItemResponse, index: number) {
  return (
    item.product?.name ??
    item.produto?.name ??
    item.productId ??
    item.produtoId ??
    `Item ${index + 1}`
  )
}

function getCartItemQuantity(item: CartItemResponse) {
  return item.quantity ?? item.quantidade ?? 1
}

export function getCartWhatsappUrl(cart: CartResponse) {
  const itemLines = cart.items.map(
    (item, index) =>
      `${getCartItemQuantity(item)}x ${getCartItemName(item, index)}`,
  )
  const message = [
    'Ola, quero finalizar esta compra da Toff Brasil:',
    ...itemLines,
    `Total: ${currency.format(cart.valorTotal)}.`,
  ].join(' ')
  const contactPath = managerWhatsapp ? `/${managerWhatsapp}` : '/'

  return `https://wa.me${contactPath}?text=${encodeURIComponent(message)}`
}
