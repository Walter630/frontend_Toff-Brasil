import {
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
  PackageSearch,
  RefreshCw,
} from 'lucide-react'
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
      setMessage(getApiErrorMessage(error, 'Nao foi possivel carregar pedidos.'))
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
      setMessage(
        getApiErrorMessage(
          error,
          'Nao foi possivel atualizar o pedido. Confira se a rota existe no backend.',
        ),
      )
    } finally {
      setActionOrderId('')
    }
  }

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Historico do cliente
            </p>
              <h1 className="mt-1 text-3xl font-bold text-brand-navy">
                Pedidos
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Acompanhe compras do cliente e confirme vendas quando estiver
                operando como gerente, admin ou caixa.
              </p>
          </div>
          <Button variant="secondary" onClick={() => void loadOrders()}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-72 place-items-center rounded-2xl border bg-white">
            <LoaderCircle className="size-9 animate-spin text-brand-orange" />
          </div>
        ) : orders.length ? (
          <div className="mt-8 grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-brand-navy">
                        Pedido #{order.id || 'sem codigo'}
                      </h2>
                      {order.status && (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-brand-orange">
                          {order.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {order.customerName ?? 'Cliente nao informado'}
                    </p>
                    {order.createdAt && (
                      <p className="mt-1 text-xs text-slate-400">
                        {order.createdAt}
                      </p>
                    )}
                  </div>
                  <strong className="text-2xl text-brand-orange">
                    {currency.format(order.total)}
                  </strong>
                </div>

                {order.items.length > 0 && (
                  <div className="mt-5 space-y-2 border-t pt-4">
                    {order.items.map((item, index) => (
                      <div
                        key={item.id ?? `${order.id}-${index}`}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-slate-600">
                          {item.productName} x{item.quantity}
                        </span>
                        <strong className="text-brand-navy">
                          {currency.format(item.subtotal)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                {canOperateStore && (
                  <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-2">
                    <Button
                      variant="secondary"
                      disabled={actionOrderId === order.id}
                      onClick={() =>
                        void updateOrderAction(
                          order.id,
                          () => orderService.confirmSale(order.id),
                          'Compra confirmada pelo gerente.',
                        )
                      }
                    >
                      {actionOrderId === order.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Confirmar compra
                    </Button>
                    <Button
                      disabled={actionOrderId === order.id}
                      onClick={() =>
                        void updateOrderAction(
                          order.id,
                          () => orderService.releaseStock(order.id),
                          'Pedido separado e baixa de estoque solicitada.',
                        )
                      }
                    >
                      {actionOrderId === order.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <PackageCheck className="size-4" />
                      )}
                      Baixar estoque
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-14 text-center">
            <PackageSearch className="mx-auto size-9 text-slate-300" />
            <h2 className="mt-4 font-bold text-brand-navy">
              Nenhum pedido encontrado
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Assim que a rota `/api/pedidos` retornar dados, eles aparecem aqui.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
