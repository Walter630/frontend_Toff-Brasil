import {
  CheckCircle2,
  Clock,
  LoaderCircle,
  Package,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../lib/api-error'
import { authService } from '../services/auth-service'
import { orderService, type OrderResponse } from '../services/order-service'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  AGUARDANDO: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 ring-amber-200' },
  PENDENTE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 ring-amber-200' },
  PAGO: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 ring-emerald-200' },
  ENVIADO: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 ring-blue-200' },
  ENTREGUE: { icon: PackageCheck, color: 'text-violet-600', bg: 'bg-violet-50 ring-violet-200' },
  CANCELADO: { icon: Package, color: 'text-red-600', bg: 'bg-red-50 ring-red-200' },
}

function getStatusConfig(status: string) {
  return statusConfig[status] ?? { icon: ShoppingBag, color: 'text-slate-600', bg: 'bg-slate-50 ring-slate-200' }
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [actionOrderId, setActionOrderId] = useState('')
  const canOperateStore = authService.canOperateStore()

  async function loadOrders() {
    setLoading(true)
    setMessage('')
    try {
      setOrders(await orderService.listMine())
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Não foi possível carregar pedidos.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  async function updateOrderAction(
    orderId: string,
    action: () => Promise<OrderResponse>,
    successMessage: string,
  ) {
    setActionOrderId(orderId)
    setMessage('')
    try {
      const updatedOrder = await action()
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? updatedOrder : order)),
      )
      setMessage(successMessage)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Não foi possível atualizar o pedido.'))
    } finally {
      setActionOrderId('')
    }
  }

  return (
    <DashboardLayout>
      <main className="px-4 py-5 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                Meus pedidos
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Acompanhe o status das suas compras.
              </p>
            </div>
            <Button variant="secondary" onClick={() => void loadOrders()}>
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {message && (
            <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-brand-navy ring-1 ring-blue-100">
              {message}
            </div>
          )}

          {loading ? (
            <div className="mt-10 grid min-h-72 place-items-center">
              <div className="text-center">
                <LoaderCircle className="mx-auto size-9 animate-spin text-brand-orange" />
                <p className="mt-3 text-sm text-slate-500">Carregando pedidos...</p>
              </div>
            </div>
          ) : orders.length ? (
            <div className="mt-6 space-y-4">
              {orders.map((order, i) => {
                const config = getStatusConfig(order.status ?? '')
                const StatusIcon = config.icon

                return (
                  <motion.article
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5"
                  >
                    {/* Order header */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`grid size-10 place-items-center rounded-xl ${config.bg} ring-1 ${config.color}`}>
                          <StatusIcon className="size-5" />
                        </span>
                        <div>
                          <h2 className="font-bold text-brand-navy">
                            Pedido #{(order.id || '').slice(0, 8)}
                          </h2>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            {order.status && (
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${config.bg} ${config.color}`}>
                                {order.status}
                              </span>
                            )}
                            {order.createdAt && (
                              <span className="text-xs text-slate-400">{order.createdAt}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <strong className="text-xl font-extrabold text-brand-orange sm:text-2xl">
                        {currency.format(order.total)}
                      </strong>
                    </div>

                    {/* Items */}
                    {order.items.length > 0 && (
                      <div className="divide-y divide-slate-100 px-5">
                        {order.items.map((item, index) => (
                          <div
                            key={item.id ?? `${order.id}-${index}`}
                            className="flex items-center justify-between gap-4 py-3 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-brand-navy">{item.productName}</p>
                              <p className="text-xs text-slate-400">Qtd: {item.quantity}</p>
                            </div>
                            <strong className="shrink-0 text-brand-navy">
                              {currency.format(item.subtotal)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions (operator/admin) */}
                    {canOperateStore && (
                      <div className="flex gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
                        <button
                          type="button"
                          disabled={actionOrderId === order.id}
                          onClick={() =>
                            void updateOrderAction(
                              order.id,
                              () => orderService.confirmSale(order.id),
                              'Compra confirmada!',
                            )
                          }
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-brand-navy transition hover:border-brand-orange/30 hover:text-brand-orange disabled:opacity-50"
                        >
                          {actionOrderId === order.id ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          Confirmar
                        </button>
                        <button
                          type="button"
                          disabled={actionOrderId === order.id}
                          onClick={() =>
                            void updateOrderAction(
                              order.id,
                              () => orderService.releaseStock(order.id),
                              'Estoque baixado!',
                            )
                          }
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-orange text-xs font-bold text-white transition hover:bg-brand-orange-dark disabled:opacity-50"
                        >
                          {actionOrderId === order.id ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <PackageCheck className="size-3.5" />
                          )}
                          Baixar estoque
                        </button>
                      </div>
                    )}
                  </motion.article>
                )
              })}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <PackageSearch className="size-12 text-slate-300" />
              <h2 className="mt-4 text-lg font-bold text-brand-navy">
                Nenhum pedido ainda
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Quando você finalizar uma compra, seus pedidos aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
