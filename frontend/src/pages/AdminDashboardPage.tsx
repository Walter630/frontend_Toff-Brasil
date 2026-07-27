import {
  AlertCircle,
  ArrowDownRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  MessageCircleMore,
  PackageCheck,
  PackagePlus,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { getApiErrorMessage } from '../lib/api-error'
import {
  adminService,
  type AdminCart,
  type AdminOrder,
  type AdminOrdersPage,
  type AdminSummary,
} from '../services/admin-service'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const initialSummary: AdminSummary = {
  carrinhosAtivos: 0,
  pedidosAguardando: 0,
  pedidosPagos: 0,
  pedidosCancelados: 0,
  faturamentoTotal: 0,
}

const initialOrders: AdminOrdersPage = {
  content: [],
  page: 0,
  totalPages: 1,
  totalElements: 0,
  size: 12,
}

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'AGUARDANDO', label: 'Aguardando' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ENTREGUE', label: 'Entregue' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const statusStyle: Record<string, string> = {
  AGUARDANDO: 'bg-amber-50 text-amber-700 ring-amber-200',
  PENDENTE: 'bg-amber-50 text-amber-700 ring-amber-200',
  PAGO: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ENVIADO: 'bg-blue-50 text-blue-700 ring-blue-200',
  ENTREGUE: 'bg-violet-50 text-violet-700 ring-violet-200',
  CANCELADO: 'bg-red-50 text-red-700 ring-red-200',
}

function formatDate(value?: string) {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : dateTime.format(parsed)
}

function statusLabel(status: string) {
  return statusOptions.find((item) => item.value === status)?.label ?? status
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyle[status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}`}
    >
      {statusLabel(status)}
    </span>
  )
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
  onClick,
}: {
  label: string
  value: string | number
  helper: string
  icon: typeof ShoppingBag
  accent: string
  onClick?: () => void
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-11 place-items-center rounded-2xl ${accent}`}>
          <Icon className="size-5" />
        </span>
        {onClick && <ArrowDownRight className="size-4 text-slate-300" />}
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{helper}</p>
    </>
  )

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >
      {content}
    </button>
  ) : (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">{content}</div>
  )
}

export function AdminDashboardPage() {
  const [activeView, setActiveView] = useState<'pedidos' | 'carrinhos'>('pedidos')
  const [summary, setSummary] = useState(initialSummary)
  const [orders, setOrders] = useState(initialOrders)
  const [carts, setCarts] = useState<AdminCart[]>([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [summaryData, ordersData, cartsData] = await Promise.all([
        adminService.getSummary(),
        adminService.getOrders(page, 12, status),
        adminService.getCarts(),
      ])
      setSummary(summaryData)
      setOrders(ordersData)
      setCarts(cartsData)
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Não foi possível carregar os dados administrativos.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    if (!query) return orders.content

    return orders.content.filter((order) =>
      [order.pedidoId, order.userName, order.userEmail, order.userPhone]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    )
  }, [orders.content, search])

  const visibleCarts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    if (!query) return carts

    return carts.filter((cart) =>
      [
        cart.carrinhoId,
        cart.userName,
        cart.userEmail,
        ...cart.itens.flatMap((item) => [
          item.nomeProduto,
          item.marcaProduto,
        ]),
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    )
  }, [carts, search])

  const openOrder = async (order: AdminOrder) => {
    setSelectedOrder(order)
    setDetailLoading(true)
    try {
      setSelectedOrder(await adminService.getOrder(order.pedidoId))
    } catch {
      // Mantém os dados resumidos já disponíveis na tabela.
    } finally {
      setDetailLoading(false)
    }
  }

  const updateStatus = async (nextStatus: string) => {
    if (!selectedOrder || nextStatus === selectedOrder.status) return
    setSavingStatus(true)
    setError('')
    try {
      const updated = await adminService.updateOrderStatus(
        selectedOrder.pedidoId,
        nextStatus,
      )
      setSelectedOrder(updated)
      await loadDashboard()
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, 'Não foi possível atualizar o status.'),
      )
    } finally {
      setSavingStatus(false)
    }
  }

  const filterByStatus = (nextStatus: string) => {
    setActiveView('pedidos')
    setStatus(nextStatus)
    setPage(0)
  }

  return (
    <DashboardLayout>
      <main className="p-4 sm:p-6 xl:p-8">
        <div className="mx-auto max-w-[1500px]">
          <header className="relative overflow-hidden rounded-[2rem] bg-black p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,.16)] sm:p-7 lg:p-9">
            <div className="absolute -top-20 right-0 size-64 rounded-full bg-brand-orange/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.16em] text-brand-orange uppercase">
                  Central administrativa
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Gestão da Toff Brasil
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                  Cadastre produtos, monte orçamentos e acompanhe pedidos e
                  carrinhos dos clientes em um só lugar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadDashboard()}
                disabled={loading}
                className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar dados
              </button>
            </div>

            <nav className="relative mt-7 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <Link
                to="/admin/produtos#cadastro"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:border-brand-orange/60 hover:bg-white/10"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-orange text-white">
                  <PackagePlus className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">Cadastrar produto</strong>
                  <small className="text-white/45">Estoque, preço e imagens</small>
                </span>
              </Link>
              <Link
                to="/pedido-presencial"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:border-brand-orange/60 hover:bg-white/10"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-brand-orange">
                  <FileText className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">Criar orçamento</strong>
                  <small className="text-white/45">Venda assistida ou proposta</small>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveView('carrinhos')}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-left transition hover:border-brand-orange/60 hover:bg-white/10"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-brand-orange">
                  <ShoppingCart className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">Carrinhos de clientes</strong>
                  <small className="text-white/45">{carts.length} ativo(s)</small>
                </span>
              </button>
              <Link
                to="/admin/clientes"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:border-brand-orange/60 hover:bg-white/10"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-brand-orange">
                  <UsersRound className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">Clientes</strong>
                  <small className="text-white/45">E-mail e telefone</small>
                </span>
              </Link>
              <Link
                to="/admin/whatsapp"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:border-brand-orange/60 hover:bg-white/10"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white">
                  <MessageCircleMore className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">Atendimento</strong>
                  <small className="text-white/45">Conversas e oportunidades</small>
                </span>
              </Link>
            </nav>
          </header>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError('')} aria-label="Fechar aviso">
                <X className="size-4" />
              </button>
            </div>
          )}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Faturamento"
              value={loading ? '—' : currency.format(summary.faturamentoTotal)}
              helper="Total de pedidos pagos"
              icon={Banknote}
              accent="bg-brand-navy text-white"
            />
            <SummaryCard
              label="Pedidos pagos"
              value={loading ? '—' : summary.pedidosPagos}
              helper="Pagamento confirmado"
              icon={CheckCircle2}
              accent="bg-emerald-100 text-emerald-700"
              onClick={() => filterByStatus('PAGO')}
            />
            <SummaryCard
              label="Aguardando"
              value={loading ? '—' : summary.pedidosAguardando}
              helper="Precisam de atenção"
              icon={Clock3}
              accent="bg-amber-100 text-amber-700"
              onClick={() => filterByStatus('AGUARDANDO')}
            />
            <SummaryCard
              label="Carrinhos ativos"
              value={loading ? '—' : summary.carrinhosAtivos}
              helper="Potenciais compras"
              icon={ShoppingCart}
              accent="bg-blue-100 text-blue-700"
              onClick={() => setActiveView('carrinhos')}
            />
            <SummaryCard
              label="Cancelados"
              value={loading ? '—' : summary.pedidosCancelados}
              helper="Pedidos não concluídos"
              icon={XCircle}
              accent="bg-red-100 text-red-700"
              onClick={() => filterByStatus('CANCELADO')}
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveView('pedidos')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeView === 'pedidos' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500'}`}
                >
                  <ShoppingBag className="size-4" />
                  Pedidos
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                    {orders.totalElements}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('carrinhos')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeView === 'carrinhos' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500'}`}
                >
                  <ShoppingCart className="size-4" />
                  Carrinhos
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                    {carts.length}
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block min-w-0 sm:w-72">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar cliente, pedido ou produto"
                    className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                {activeView === 'pedidos' && (
                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value)
                      setPage(0)
                    }}
                    className="h-11 rounded-xl border bg-white px-3 text-sm font-semibold text-brand-navy outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value || 'todos'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-72 place-items-center">
                <div className="text-center text-slate-500">
                  <LoaderCircle className="mx-auto size-7 animate-spin text-brand-orange" />
                  <p className="mt-3 text-sm font-medium">Carregando painel...</p>
                </div>
              </div>
            ) : activeView === 'pedidos' ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-3 font-bold">Pedido</th>
                        <th className="px-5 py-3 font-bold">Cliente</th>
                        <th className="px-5 py-3 font-bold">Data</th>
                        <th className="px-5 py-3 font-bold">Status</th>
                        <th className="px-5 py-3 text-right font-bold">Total</th>
                        <th className="px-5 py-3 text-right font-bold">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {visibleOrders.map((order) => (
                        <tr key={order.pedidoId} className="transition hover:bg-slate-50/80">
                          <td className="px-5 py-4">
                            <p className="font-bold text-brand-navy">#{order.pedidoId.slice(0, 8)}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{order.itens.length} item(ns)</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-700">{order.userName}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{order.userEmail}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{formatDate(order.dataCriacao)}</td>
                          <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                          <td className="px-5 py-4 text-right font-extrabold text-brand-navy">{currency.format(order.total)}</td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => void openOrder(order)}
                              className="inline-flex size-9 items-center justify-center rounded-lg border text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-brand-orange"
                              aria-label={`Ver pedido ${order.pedidoId}`}
                            >
                              <Eye className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!visibleOrders.length && (
                  <div className="grid min-h-64 place-items-center p-6 text-center">
                    <div>
                      <PackageCheck className="mx-auto size-10 text-slate-300" />
                      <p className="mt-3 font-bold text-brand-navy">Nenhum pedido encontrado</p>
                      <p className="mt-1 text-sm text-slate-400">Ajuste a busca ou o filtro de status.</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between border-t px-5 py-4">
                  <p className="text-xs text-slate-400">
                    Página {orders.page + 1} de {orders.totalPages} · {orders.totalElements} pedido(s)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      disabled={orders.page === 0}
                      className="grid size-9 place-items-center rounded-lg border text-brand-navy disabled:opacity-30"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(orders.totalPages - 1, current + 1))}
                      disabled={orders.page + 1 >= orders.totalPages}
                      className="grid size-9 place-items-center rounded-lg border text-brand-navy disabled:opacity-30"
                      aria-label="Próxima página"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 2xl:grid-cols-3">
                {visibleCarts.map((cart) => (
                  <CartCard key={cart.carrinhoId} cart={cart} />
                ))}
                {!visibleCarts.length && (
                  <div className="col-span-full grid min-h-64 place-items-center text-center">
                    <div>
                      <ShoppingCart className="mx-auto size-10 text-slate-300" />
                      <p className="mt-3 font-bold text-brand-navy">Nenhum carrinho ativo</p>
                      <p className="mt-1 text-sm text-slate-400">Não há oportunidades abertas agora.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          loading={detailLoading}
          saving={savingStatus}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(nextStatus) => void updateStatus(nextStatus)}
        />
      )}
    </DashboardLayout>
  )
}

function CartCard({ cart }: { cart: AdminCart }) {
  const hasPhone = cart.userPhone && cart.userPhone !== '—'

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-brand-orange/30 hover:shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
              <UserRound className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-bold">{cart.userName}</h3>
              <p className="truncate text-xs text-blue-100/70">{cart.userEmail}</p>
              {hasPhone && (
                <a
                  href={`https://wa.me/${cart.userPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-300 transition hover:bg-white/20"
                >
                  <Phone className="size-3" />
                  {cart.userPhone}
                </a>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
            {cart.totalItens} item(ns)
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-100">
        {cart.itens.slice(0, 4).map((item) => (
          <div key={item.itemId || item.nomeProduto} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-navy">{item.nomeProduto}</p>
              {item.marcaProduto !== '—' && (
                <p className="mt-0.5 truncate text-xs font-semibold text-brand-orange">
                  Marca: {item.marcaProduto}
                </p>
              )}
              <p className="mt-0.5 text-xs text-slate-400">
                {item.quantidade}× {currency.format(item.precoUnitario)}
              </p>
            </div>
            <strong className="shrink-0 text-sm font-bold text-brand-navy">
              {currency.format(item.subtotal)}
            </strong>
          </div>
        ))}
        {cart.itens.length > 4 && (
          <p className="px-4 py-2 text-center text-xs font-semibold text-slate-400">
            + {cart.itens.length - 4} produto(s)
          </p>
        )}
        {!cart.itens.length && (
          <p className="px-4 py-4 text-center text-xs text-slate-400">Carrinho vazio</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atualizado</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{formatDate(cart.ultimaAtualizacao)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
          <p className="text-lg font-extrabold text-brand-orange">{currency.format(cart.valorTotal)}</p>
        </div>
      </div>
    </article>
  )
}

function OrderDrawer({
  order,
  loading,
  saving,
  onClose,
  onStatusChange,
}: {
  order: AdminOrder
  loading: boolean
  saving: boolean
  onClose: () => void
  onStatusChange: (status: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-brand-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar detalhes"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">Detalhes do pedido</p>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-navy">#{order.pedidoId.slice(0, 8)}</h2>
            <p className="mt-1 text-xs text-slate-400">Criado em {formatDate(order.dataCriacao)}</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-xl border text-slate-500 hover:bg-slate-50" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {loading && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs font-semibold text-blue-700">
              <LoaderCircle className="size-4 animate-spin" /> Atualizando detalhes...
            </div>
          )}

          <section className="rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-slate-100 text-brand-navy">
                <UserRound className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-brand-navy">{order.userName}</h3>
                <p className="truncate text-sm text-slate-500">{order.userEmail}</p>
                <p className="text-sm text-slate-500">{order.userPhone}</p>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-brand-navy">Itens comprados</h3>
              <span className="text-xs font-semibold text-slate-400">{order.itens.length} item(ns)</span>
            </div>
            <div className="divide-y rounded-2xl border">
              {order.itens.map((item) => (
                <div key={item.itemId || item.nomeProduto} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700">{item.nomeProduto}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.quantidade} × {currency.format(item.precoUnitario)}</p>
                  </div>
                  <strong className="shrink-0 text-brand-navy">{currency.format(item.subtotal)}</strong>
                </div>
              ))}
              {!order.itens.length && <p className="p-4 text-sm text-slate-400">Nenhum item informado.</p>}
            </div>
          </section>

          <section className="mt-5 rounded-2xl bg-brand-navy p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-100/70">Total do pedido</span>
              <strong className="text-2xl">{currency.format(order.total)}</strong>
            </div>
          </section>
        </div>

        <footer className="border-t bg-slate-50 p-5 sm:p-6">
          <label htmlFor="order-status" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Atualizar status
          </label>
          <div className="flex items-center gap-3">
            <select
              id="order-status"
              value={order.status}
              onChange={(event) => onStatusChange(event.target.value)}
              disabled={saving}
              className="h-12 min-w-0 flex-1 rounded-xl border bg-white px-3 text-sm font-bold text-brand-navy outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
            >
              {statusOptions.filter((option) => option.value).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
              {!statusOptions.some((option) => option.value === order.status) && (
                <option value={order.status}>{statusLabel(order.status)}</option>
              )}
            </select>
            {saving && <LoaderCircle className="size-5 animate-spin text-brand-orange" />}
          </div>
        </footer>
      </aside>
    </div>
  )
}
