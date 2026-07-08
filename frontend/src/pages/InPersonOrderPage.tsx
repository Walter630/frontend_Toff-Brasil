import type { FormEvent } from 'react'

import { FileText, Printer, ReceiptText, Save } from 'lucide-react'
import { useMemo, useState } from 'react'

import { CatalogState } from '../components/catalog/CatalogState'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useProducts } from '../hooks/useProducts'
import { couponService } from '../services/coupon-service'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type LocalOrder = {
  id: string
  customerName: string
  customerPhone: string
  customerDocument: string
  productName: string
  quantity: number
  subtotal: number
  discount: number
  total: number
  couponCode: string
  paymentMethod: string
  notes: string
  createdAt: string
}

function getOrders() {
  const stored = localStorage.getItem('toffbr:in-person-orders')

  if (!stored) {
    return [] as LocalOrder[]
  }

  try {
    return JSON.parse(stored) as LocalOrder[]
  } catch {
    return [] as LocalOrder[]
  }
}

function saveOrders(orders: LocalOrder[]) {
  localStorage.setItem('toffbr:in-person-orders', JSON.stringify(orders))
}

export function InPersonOrderPage() {
  const { products, loading, error, reload } = useProducts()
  const [orders, setOrders] = useState<LocalOrder[]>(getOrders)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerDocument, setCustomerDocument] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [couponCode, setCouponCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Pix')
  const [notes, setNotes] = useState('')
  const coupons = couponService.list()

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? products[0],
    [productId, products],
  )
  const parsedQuantity = Math.max(Number(quantity) || 1, 1)
  const subtotal = selectedProduct ? selectedProduct.price * parsedQuantity : 0
  const activeCoupon = coupons.find(
    (coupon) =>
      coupon.active &&
      coupon.code.toUpperCase() === couponCode.trim().toUpperCase() &&
      subtotal >= coupon.minimumOrder,
  )
  const discount = activeCoupon ? subtotal * (activeCoupon.percentage / 100) : 0
  const total = Math.max(subtotal - discount, 0)

  const persistOrder = (order: LocalOrder) => {
    const nextOrders = [order, ...orders]
    setOrders(nextOrders)
    saveOrders(nextOrders)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedProduct || !customerName.trim()) {
      return
    }

    persistOrder({
      id: crypto.randomUUID(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerDocument: customerDocument.trim(),
      productName: selectedProduct.name,
      quantity: parsedQuantity,
      subtotal,
      discount,
      total,
      couponCode: activeCoupon?.code ?? '',
      paymentMethod,
      notes: notes.trim(),
      createdAt: new Date().toLocaleString('pt-BR'),
    })
    setCustomerName('')
    setCustomerPhone('')
    setCustomerDocument('')
    setQuantity('1')
    setCouponCode('')
    setNotes('')
  }

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Venda assistida
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Pedido presencial
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Use esta tela quando o cliente estiver na loja e o gerente
              precisar registrar o pedido com os dados do cliente.
            </p>
          </div>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir comprovante
          </Button>
        </div>

        {loading || error ? (
          <div className="mt-8">
            <CatalogState
              loading={loading}
              error={error}
              onRetry={() => void reload()}
            />
          </div>
        ) : (
          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.75fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border bg-white p-6"
            >
              <h2 className="text-lg font-bold text-brand-navy">
                Dados do pedido
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Input
                  id="customer-name"
                  label="Nome do cliente"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Nome completo"
                  required
                />
                <Input
                  id="customer-phone"
                  label="Telefone"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="(00) 00000-0000"
                />
                <Input
                  id="customer-document"
                  label="CPF ou documento"
                  value={customerDocument}
                  onChange={(event) => setCustomerDocument(event.target.value)}
                  placeholder="Opcional"
                />
                <label htmlFor="product-id" className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-navy">
                    Produto
                  </span>
                  <select
                    id="product-id"
                    value={selectedProduct?.id ?? ''}
                    onChange={(event) => setProductId(event.target.value)}
                    className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  id="quantity"
                  label="Quantidade"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
                <Input
                  id="coupon-code-order"
                  label="Cupom"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="EX.: TOFF10"
                />
                <label htmlFor="payment-method" className="block">
                  <span className="mb-2 block text-sm font-medium text-brand-navy">
                    Pagamento
                  </span>
                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                  >
                    <option>Pix</option>
                    <option>Cartão de crédito</option>
                    <option>Cartão de débito</option>
                    <option>Dinheiro</option>
                  </select>
                </label>
                <label htmlFor="order-notes" className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-brand-navy">
                    Observações
                  </span>
                  <textarea
                    id="order-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-24 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                    placeholder="Cor, tamanho, prazo combinado ou detalhe do cliente"
                  />
                </label>
              </div>

              <Button type="submit" className="mt-5 w-full">
                <Save className="size-4" />
                Gerar pedido
              </Button>
            </form>

            <aside className="rounded-2xl border bg-white p-6">
              <div className="flex items-center gap-3">
                <ReceiptText className="size-6 text-brand-orange" />
                <h2 className="text-lg font-bold text-brand-navy">
                  Comprovante
                </h2>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Cliente</span>
                  <strong className="text-right text-brand-navy">
                    {customerName || 'Não informado'}
                  </strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Produto</span>
                  <strong className="text-right text-brand-navy">
                    {selectedProduct?.name ?? 'Selecione um produto'}
                  </strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>
                  <strong>{currency.format(subtotal)}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Desconto</span>
                  <strong>{currency.format(discount)}</strong>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between gap-4 text-xl font-bold text-brand-navy">
                    <span>Total</span>
                    <span>{currency.format(total)}</span>
                  </div>
                </div>
              </div>
              {activeCoupon && (
                <p className="mt-5 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-brand-orange">
                  Cupom {activeCoupon.code} aplicado.
                </p>
              )}
            </aside>
          </section>
        )}

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-brand-navy">
            <FileText className="size-5 text-brand-orange" />
            Últimos pedidos emitidos
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {orders.slice(0, 6).map((order) => (
              <article key={order.id} className="rounded-2xl border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-brand-navy">
                      {order.customerName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.productName} x{order.quantity}
                    </p>
                  </div>
                  <strong className="text-brand-orange">
                    {currency.format(order.total)}
                  </strong>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {order.createdAt} · {order.paymentMethod}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
