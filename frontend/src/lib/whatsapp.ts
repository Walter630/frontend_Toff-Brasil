import type { CartItemResponse, CartResponse } from '../types/cart'
import type { Product } from '../types/product'
import { getProductPublicName, stripBrandFromName } from './product-display'

const managerWhatsapp = import.meta.env.VITE_MANAGER_WHATSAPP?.replace(/\D/g, '')

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function getProductWhatsappUrl(product: Product) {
  const message = [
    `Ola, tenho interesse neste item da Toff Brasil: ${getProductPublicName(
      product,
    )}.`,
    `Categoria: ${product.categoria}.`,
    'Quantidade solicitada: 1 unidade.',
    `Preco: ${currency.format(product.price)}.`,
  ].join(' ')

  const contactPath = managerWhatsapp ? `/${managerWhatsapp}` : '/'

  return `https://wa.me${contactPath}?text=${encodeURIComponent(message)}`
}

export function getProductRestockWhatsappUrl(product: Product) {
  const message = [
    `Olá, gostaria de saber a previsão de reposição deste produto da ToffBrasil: ${getProductPublicName(
      product,
    )}.`,
    `Categoria: ${product.categoria}.`,
    `Preço anunciado: ${currency.format(product.price)}.`,
  ].join(' ')
  const contactPath = managerWhatsapp ? `/${managerWhatsapp}` : '/'

  return `https://wa.me${contactPath}?text=${encodeURIComponent(message)}`
}

function getCartItemName(item: CartItemResponse, index: number) {
  const name =
    item.name ??
    item.product?.name ??
    item.produto?.name ??
    item.productId ??
    item.produtoId ??
    `Item ${index + 1}`

  return stripBrandFromName(name)
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

type PaymentWhatsappData = {
  id?: string
  status: string
  formaPagamento: string
  valorTotal?: number
}

export function getPaymentWhatsappUrl(
  cart: CartResponse,
  payment: PaymentWhatsappData,
  notes?: string,
) {
  const itemLines = cart.items.map((item, index) => {
    const quantity = getCartItemQuantity(item)
    const unitPrice =
      item.unitPrice ??
      item.precoUnitario ??
      item.price ??
      item.product?.price ??
      item.produto?.price ??
      0
    const itemTotal = item.total ?? item.subtotal ?? unitPrice * quantity

    return `- ${quantity}x ${getCartItemName(item, index)}: ${currency.format(itemTotal)}`
  })
  const calculatedTotal = cart.items.reduce((total, item) => {
    const quantity = getCartItemQuantity(item)
    const unitPrice =
      item.unitPrice ??
      item.precoUnitario ??
      item.price ??
      item.product?.price ??
      item.produto?.price ??
      0

    return total + (item.total ?? item.subtotal ?? unitPrice * quantity)
  }, 0)
  const total = payment.valorTotal ?? cart.valorTotal ?? calculatedTotal
  const message = [
    'Ola! Efetuei o pagamento da minha compra na Toff Brasil.',
    `Pedido/carrinho: ${cart.id}.`,
    payment.id ? `Pagamento: ${payment.id}.` : '',
    `Metodo: ${payment.formaPagamento}.`,
    `Status informado: ${payment.status}.`,
    'Itens:',
    ...itemLines,
    `Total: ${currency.format(total)}.`,
    notes?.trim() ? `Observacao: ${notes.trim()}` : '',
    'Vou enviar o comprovante de pagamento nesta conversa.',
  ]
    .filter(Boolean)
    .join('\n')
  const contactPath = managerWhatsapp ? `/${managerWhatsapp}` : '/'

  return `https://wa.me${contactPath}?text=${encodeURIComponent(message)}`
}
