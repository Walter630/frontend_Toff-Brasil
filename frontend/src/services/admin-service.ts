import { api } from '../lib/api'

export type AdminSummary = {
  carrinhosAtivos: number
  pedidosAguardando: number
  pedidosPagos: number
  pedidosCancelados: number
  faturamentoTotal: number
}

export type AdminCartItem = {
  itemId: string
  produtoId?: string
  nomeProduto: string
  marcaProduto: string
  imagemProduto?: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export type AdminCart = {
  carrinhoId: string
  userId?: string
  userEmail: string
  userName: string
  userPhone: string
  totalItens: number
  valorTotal: number
  ultimaAtualizacao?: string
  itens: AdminCartItem[]
}

export type AdminOrderItem = {
  itemId: string
  nomeProduto: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export type AdminOrder = {
  pedidoId: string
  userId?: string
  userEmail: string
  userName: string
  userPhone: string
  total: number
  status: string
  dataCriacao?: string
  dataAtualizacao?: string
  itens: AdminOrderItem[]
}

export type AdminOrdersPage = {
  content: AdminOrder[]
  page: number
  totalPages: number
  totalElements: number
  size: number
}

export type AdminCustomer = {
  id: string
  name: string
  email: string
  phone: string
  role?: string
  lastActivity?: string
  source: 'conta' | 'atividade'
}

type UnknownRecord = Record<string, unknown>

const asObject = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {}

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeOrderItem(value: unknown): AdminOrderItem {
  const item = asObject(value)
  const quantidade = asNumber(item.quantidade ?? item.quantity)
  const precoUnitario = asNumber(item.precoUnitario ?? item.unitPrice)

  return {
    itemId: asString(item.itemId ?? item.id),
    nomeProduto: asString(item.nomeProduto ?? item.productName, 'Produto'),
    quantidade,
    precoUnitario,
    subtotal: asNumber(item.subtotal, quantidade * precoUnitario),
  }
}

function normalizeOrder(value: unknown): AdminOrder {
  const order = asObject(value)
  const rawItems = order.itens ?? order.items

  return {
    pedidoId: asString(order.pedidoId ?? order.id),
    userId: asString(order.userId) || undefined,
    userEmail: asString(order.userEmail ?? order.email, '—'),
    userName: asString(order.userName ?? order.customerName, '—'),
    userPhone: asString(order.userPhone ?? order.phone, '—'),
    total: asNumber(order.total ?? order.valorTotal),
    status: asString(order.status, 'AGUARDANDO'),
    dataCriacao: asString(order.dataCriacao ?? order.createdAt) || undefined,
    dataAtualizacao:
      asString(order.dataAtualizacao ?? order.updatedAt) || undefined,
    itens: Array.isArray(rawItems) ? rawItems.map(normalizeOrderItem) : [],
  }
}

function normalizeCartItem(value: unknown): AdminCartItem {
  const item = asObject(value)
  const quantidade = asNumber(item.quantidade ?? item.quantity ?? item.qtd)
  const precoUnitario = asNumber(
    item.precoUnitario ?? item.unitPrice ?? item.preco ?? item.price ?? item.valor,
  )

  return {
    itemId: asString(item.itemId ?? item.id ?? item.produtoId ?? item.productId),
    produtoId:
      asString(item.produtoId ?? item.productId ?? item.produtoUuid) ||
      undefined,
    nomeProduto: asString(
      item.nomeProduto ??
        item.productName ??
        item.nome ??
        item.name ??
        item.produto ??
        item.descricao ??
        item.description ??
        item.titulo ??
        item.title,
      'Produto sem nome',
    ),
    marcaProduto: asString(
      item.marcaProduto ?? item.productBrand ?? item.marca ?? item.brand,
      '—',
    ),
    imagemProduto:
      asString(
        item.imagemProduto ??
          item.productImage ??
          item.imagem ??
          item.image,
      ) || undefined,
    quantidade,
    precoUnitario,
    subtotal: asNumber(item.subtotal ?? item.total, quantidade * precoUnitario),
  }
}

function normalizeCart(value: unknown): AdminCart {
  const cart = asObject(value)
  const rawItems = cart.itens ?? cart.items

  return {
    carrinhoId: asString(cart.carrinhoId ?? cart.id),
    userId: asString(cart.userId) || undefined,
    userEmail: asString(cart.userEmail ?? cart.email, '—'),
    userName: asString(cart.userName ?? cart.customerName, '—'),
    userPhone: asString(cart.userPhone ?? cart.phone ?? cart.telefone, '—'),
    totalItens: asNumber(cart.totalItens ?? cart.itemCount),
    valorTotal: asNumber(cart.valorTotal ?? cart.total),
    ultimaAtualizacao:
      asString(cart.ultimaAtualizacao ?? cart.updatedAt) || undefined,
    itens: Array.isArray(rawItems) ? rawItems.map(normalizeCartItem) : [],
  }
}

function normalizeCustomer(value: unknown, index: number): AdminCustomer {
  const customer = asObject(value)

  return {
    id: asString(customer.id ?? customer.userId, `cliente-${index}`),
    name: asString(
      customer.name ?? customer.nome ?? customer.username ?? customer.userName,
      'Cliente',
    ),
    email: asString(customer.email ?? customer.userEmail, '—'),
    phone: asString(
      customer.phone ?? customer.telefone ?? customer.userPhone,
      '—',
    ),
    role: asString(customer.role ?? customer.perfil) || undefined,
    lastActivity:
      asString(
        customer.lastActivity ??
          customer.ultimoAcesso ??
          customer.updatedAt ??
          customer.dataAtualizacao,
      ) || undefined,
    source: 'conta',
  }
}

function mergeCustomersFromActivity(
  carts: AdminCart[],
  orders: AdminOrder[],
): AdminCustomer[] {
  const customers = new Map<string, AdminCustomer>()

  const addCustomer = (
    id: string | undefined,
    name: string,
    email: string,
    phone: string,
    lastActivity?: string,
  ) => {
    const key = email !== '—' ? email.toLowerCase() : id || `${name}-${phone}`
    const current = customers.get(key)
    const nextActivity = lastActivity || current?.lastActivity

    customers.set(key, {
      id: id || current?.id || key,
      name: name !== '—' ? name : current?.name || 'Cliente',
      email: email !== '—' ? email : current?.email || '—',
      phone: phone !== '—' ? phone : current?.phone || '—',
      lastActivity: nextActivity,
      source: 'atividade',
    })
  }

  carts.forEach((cart) =>
    addCustomer(
      cart.userId,
      cart.userName,
      cart.userEmail,
      cart.userPhone,
      cart.ultimaAtualizacao,
    ),
  )
  orders.forEach((order) =>
    addCustomer(
      order.userId,
      order.userName,
      order.userEmail,
      order.userPhone,
      order.dataAtualizacao ?? order.dataCriacao,
    ),
  )

  return [...customers.values()]
}

export const adminService = {
  async getSummary(): Promise<AdminSummary> {
    const { data } = await api.get('/admin/summary')
    const summary = asObject(data)

    return {
      carrinhosAtivos: asNumber(summary.carrinhosAtivos),
      pedidosAguardando: asNumber(summary.pedidosAguardando),
      pedidosPagos: asNumber(summary.pedidosPagos),
      pedidosCancelados: asNumber(summary.pedidosCancelados),
      faturamentoTotal: asNumber(summary.faturamentoTotal),
    }
  },

  async getCarts(): Promise<AdminCart[]> {
    const { data } = await api.get('/admin/carrinhos')
    const response = asObject(data)
    const carts = Array.isArray(data)
      ? data
      : (response.content ?? response.carrinhos ?? response.data)

    return Array.isArray(carts) ? carts.map(normalizeCart) : []
  },

  async getCustomers(): Promise<AdminCustomer[]> {
    try {
      const { data } = await api.get('/admin/usuarios')
      const response = asObject(data)
      const customers = Array.isArray(data)
        ? data
        : (response.content ?? response.usuarios ?? response.users ?? response.data)

      return Array.isArray(customers)
        ? customers.map((customer, index) => normalizeCustomer(customer, index))
        : []
    } catch {
      const [cartsResult, ordersResult] = await Promise.allSettled([
        this.getCarts(),
        this.getOrders(0, 200),
      ])
      const carts = cartsResult.status === 'fulfilled' ? cartsResult.value : []
      const orders =
        ordersResult.status === 'fulfilled' ? ordersResult.value.content : []

      if (!carts.length && !orders.length) {
        throw new Error('Não foi possível carregar os clientes.')
      }

      return mergeCustomersFromActivity(carts, orders)
    }
  },

  async getOrders(page = 0, size = 12, status?: string): Promise<AdminOrdersPage> {
    const { data } = await api.get('/admin/pedidos', {
      params: { page, size, status: status || undefined },
    })
    const response = asObject(data)
    const rawOrders = Array.isArray(data)
      ? data
      : (response.content ?? response.pedidos ?? response.data)
    const content = Array.isArray(rawOrders) ? rawOrders.map(normalizeOrder) : []

    return {
      content,
      page: asNumber(response.number ?? response.page, page),
      totalPages: Math.max(1, asNumber(response.totalPages, 1)),
      totalElements: asNumber(response.totalElements, content.length),
      size: asNumber(response.size, size),
    }
  },

  async getOrder(id: string): Promise<AdminOrder> {
    const { data } = await api.get(`/admin/pedidos/${encodeURIComponent(id)}`)
    return normalizeOrder(data)
  },

  async getCustomerOrders(userId: string): Promise<AdminOrder[]> {
    const { data } = await api.get(
      `/admin/usuarios/${encodeURIComponent(userId)}/pedidos`,
    )
    const response = asObject(data)
    const orders = Array.isArray(data)
      ? data
      : (response.content ?? response.pedidos ?? response.data)

    return Array.isArray(orders) ? orders.map(normalizeOrder) : []
  },

  async updateOrderStatus(id: string, status: string): Promise<AdminOrder> {
    const { data } = await api.patch(
      `/admin/pedidos/${encodeURIComponent(id)}/status`,
      undefined,
      { params: { status } },
    )
    return normalizeOrder(data)
  },
}
