import { api } from '../lib/api'

export type OrderItemResponse = {
  id?: string
  productId?: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type OrderResponse = {
  id: string
  customerName?: string
  status?: string
  total: number
  createdAt?: string
  items: OrderItemResponse[]
}

export type OrderCreatePayload = {
  customerName: string
  customerPhone?: string
  customerDocument?: string
  productId: string
  quantity: number
  couponCode?: string
  paymentMethod?: string
  notes?: string
  status?: string
  confirmarVenda?: boolean
  baixarEstoque?: boolean
}

export type OrderCheckoutResponse = {
  pedidoId: string
  valorTotal: number
}

type RawOrder = Record<string, unknown>

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0) {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function getOrderItems(order: RawOrder): OrderItemResponse[] {
  const items = order.items ?? order.itens ?? order.orderItems ?? order.produtos

  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => {
    const rawItem = item as RawOrder
    const product = (rawItem.product ?? rawItem.produto ?? {}) as RawOrder
    const quantity = asNumber(rawItem.quantity ?? rawItem.quantidade, 1)
    const unitPrice = asNumber(
      rawItem.unitPrice ??
        rawItem.precoUnitario ??
        product.price ??
        product.preco,
    )

    return {
      id: asString(rawItem.id),
      productId:
        asString(
          rawItem.productId ?? rawItem.produtoId ?? product.id ?? product.uuid,
        ) || undefined,
      productName: asString(
        rawItem.productName ?? rawItem.nomeProduto ?? product.name ?? product.nome,
        'Produto',
      ),
      quantity,
      unitPrice,
      subtotal: asNumber(rawItem.subtotal ?? rawItem.total, unitPrice * quantity),
    }
  })
}

function isRouteMissing(error: unknown) {
  if (!(error instanceof Error) || !('response' in error)) {
    return false
  }

  const response = error.response as { status?: number } | undefined
  return response?.status === 404 || response?.status === 405
}

async function patchOrderAction(
  id: string,
  action: string,
  fallbackPayload: Record<string, unknown>,
) {
  try {
    const { data } = await api.patch(
      `/pedidos/${encodeURIComponent(id)}/${action}`,
      fallbackPayload,
    )

    return normalizeOrder(data)
  } catch (error) {
    if (!isRouteMissing(error)) {
      throw error
    }

    const { data } = await api.patch(
      `/pedidos/${encodeURIComponent(id)}`,
      fallbackPayload,
    )

    return normalizeOrder(data)
  }
}

function normalizeOrder(data: unknown): OrderResponse {
  const order = (data && typeof data === 'object' ? data : {}) as RawOrder
  const items = getOrderItems(order)
  const fallbackTotal = items.reduce((total, item) => total + item.subtotal, 0)

  return {
    id: asString(order.id),
    customerName: asString(order.customerName ?? order.nomeCliente) || undefined,
    status: asString(order.status) || undefined,
    total: asNumber(order.total ?? order.valorTotal, fallbackTotal),
    createdAt: asString(order.createdAt ?? order.criadoEm) || undefined,
    items,
  }
}

function normalizeOrdersResponse(data: unknown) {
  if (Array.isArray(data)) {
    return data.map(normalizeOrder)
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  const response = data as Record<string, unknown>
  const orders =
    response.orders ?? response.pedidos ?? response.content ?? response.data

  return Array.isArray(orders) ? orders.map(normalizeOrder) : []
}

function normalizeCheckoutResponse(data: unknown): OrderCheckoutResponse {
  const response =
    data && typeof data === 'object' ? (data as RawOrder) : ({} as RawOrder)
  const checkout =
    response.data && typeof response.data === 'object'
      ? (response.data as RawOrder)
      : response

  return {
    pedidoId: asString(checkout.pedidoId ?? checkout.id),
    valorTotal: asNumber(checkout.valorTotal ?? checkout.total),
  }
}

export const orderService = {
  async listMine() {
    const { data } = await api.get('/pedidos')
    return normalizeOrdersResponse(data)
  },

  async create(payload: OrderCreatePayload) {
    const { data } = await api.post('/pedidos', payload)
    return normalizeOrder(data)
  },

  async checkout() {
    const { data } = await api.post('/pedidos/checkout')
    const checkout = normalizeCheckoutResponse(data)

    if (!checkout.pedidoId) {
      throw new Error('O checkout não retornou o ID do pedido.')
    }

    return checkout
  },

  async confirmSale(id: string) {
    return patchOrderAction(id, 'confirmar', {
      status: 'CONFIRMADO',
      confirmarVenda: true,
    })
  },

  async releaseStock(id: string) {
    return patchOrderAction(id, 'baixar-estoque', {
      status: 'SEPARADO',
      baixarEstoque: true,
    })
  },
}
