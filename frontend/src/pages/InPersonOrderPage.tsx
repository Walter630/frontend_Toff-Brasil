import type { FormEvent } from 'react'

import {
  ArrowLeft,
  Barcode,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Printer,
  ReceiptText,
  Save,
  ScanLine,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { BarcodeScannerModal } from '../components/barcode/BarcodeScannerModal'
import { CatalogState } from '../components/catalog/CatalogState'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useProducts } from '../hooks/useProducts'
import { getApiErrorMessage } from '../lib/api-error'
import { getProductPublicName } from '../lib/product-display'
import { couponService, type DiscountCoupon } from '../services/coupon-service'
import { orderService } from '../services/order-service'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type LocalOrder = {
  id: string
  kind?: 'ORCAMENTO' | 'VENDA'
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
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([])
  const [saving, setSaving] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerDocument, setCustomerDocument] = useState('')
  const [productId, setProductId] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [couponCode, setCouponCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Pix')
  const [notes, setNotes] = useState('')

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLocaleLowerCase('pt-BR')

    if (!search) {
      return products
    }

    return products.filter((product) =>
      [
        getProductPublicName(product),
        product.categoria,
        product.marca,
        product.brand,
        product.type,
        product.codigoBarras,
        product.barcode,
      ].some((value) => value?.toLocaleLowerCase('pt-BR').includes(search)),
    )
  }, [productSearch, products])
  const selectedProduct = useMemo(
    () =>
      filteredProducts.find((product) => product.id === productId) ??
      filteredProducts[0],
    [filteredProducts, productId],
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

  const findProductByBarcode = (code: string) => {
    const normalizedCode = code.trim()

    if (!normalizedCode) {
      return undefined
    }

    return products.find((product) =>
      [product.codigoBarras, product.barcode, product.id]
        .filter(Boolean)
        .some((value) => value === normalizedCode),
    )
  }

  const selectProductFromBarcode = (code: string) => {
    const product = findProductByBarcode(code)

    if (!product) {
      setSubmitMessage(`Codigo ${code} nao encontrado no catalogo.`)
      return
    }

    const sameProduct = selectedProduct?.id === product.id
    setProductId(product.id)
    setProductSearch(getProductPublicName(product))
    setQuantity((currentQuantity) =>
      sameProduct ? String((Number(currentQuantity) || 1) + 1) : '1',
    )
    setBarcodeInput(code)
    setSubmitMessage(`${getProductPublicName(product)} selecionado pelo bip.`)
  }

  const persistOrder = (order: LocalOrder) => {
    const nextOrders = [order, ...orders]
    setOrders(nextOrders)
    saveOrders(nextOrders)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage('')
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null
    const isQuote = submitter?.value === 'quote'

    if (!selectedProduct || !customerName.trim()) {
      return
    }

    setSaving(true)

    try {
      if (isQuote) {
        persistOrder({
          id: `orcamento-${crypto.randomUUID()}`,
          kind: 'ORCAMENTO',
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerDocument: customerDocument.trim(),
          productName: getProductPublicName(selectedProduct),
          quantity: parsedQuantity,
          subtotal,
          discount,
          total,
          couponCode: activeCoupon?.code ?? '',
          paymentMethod,
          notes: notes.trim(),
          createdAt: new Date().toLocaleString('pt-BR'),
        })
        setSubmitMessage(
          'Orçamento salvo sem baixar o estoque. Use Imprimir para entregar ao cliente.',
        )
        return
      }

      const createdOrder = await orderService.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerDocument: customerDocument.trim(),
        productId: selectedProduct.id,
        quantity: parsedQuantity,
        couponCode: activeCoupon?.code,
        paymentMethod,
        notes: notes.trim(),
        status: 'CONFIRMADO',
        confirmarVenda: true,
        baixarEstoque: true,
      })

      persistOrder({
        id: createdOrder.id || crypto.randomUUID(),
        kind: 'VENDA',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerDocument: customerDocument.trim(),
        productName: getProductPublicName(selectedProduct),
        quantity: parsedQuantity,
        subtotal,
        discount,
        total: createdOrder.total || total,
        couponCode: activeCoupon?.code ?? '',
        paymentMethod,
        notes: notes.trim(),
        createdAt: createdOrder.createdAt ?? new Date().toLocaleString('pt-BR'),
      })
      setCustomerName('')
      setCustomerPhone('')
      setCustomerDocument('')
      setQuantity('1')
      setBarcodeInput('')
      setCouponCode('')
      setNotes('')
      setSubmitMessage('Pedido enviado ao backend.')
    } catch (error) {
      setSubmitMessage(
        getApiErrorMessage(error, 'Nao foi possivel gerar pedido.'),
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    async function loadCoupons() {
      try {
        setCoupons(await couponService.list())
      } catch {
        setCoupons(couponService.defaultCoupons())
      }
    }

    void loadCoupons()
  }, [])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <Link
          to="/dashboard"
          className="mb-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-extrabold text-brand-navy transition hover:border-brand-orange hover:bg-orange-50 hover:text-brand-orange"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-brand-orange text-sm font-semibold">
              Atendimento comercial
            </p>
            <h1 className="text-brand-navy mt-1 text-3xl font-bold">
              Orçamento e venda assistida
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monte uma proposta sem alterar o estoque ou confirme a venda
              quando o cliente aprovar.
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
              <h2 className="text-brand-navy text-lg font-bold">
                Dados do pedido
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-slate-50 p-3 md:col-span-2">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label
                      htmlFor="barcode-order"
                      className="block min-w-0 flex-1"
                    >
                      <span className="text-brand-navy mb-2 flex items-center gap-2 text-sm font-medium">
                        <Barcode className="text-brand-orange size-4" />
                        Codigo de barras
                      </span>
                      <input
                        id="barcode-order"
                        value={barcodeInput}
                        onChange={(event) =>
                          setBarcodeInput(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            selectProductFromBarcode(barcodeInput)
                          }
                        }}
                        placeholder="Passe o bip ou digite o codigo"
                        className="text-brand-ink focus:border-brand-orange h-12 w-full rounded-xl border bg-white px-4 text-sm transition outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </label>
                    <Button
                      className="self-end"
                      variant="secondary"
                      onClick={() => setScannerOpen(true)}
                    >
                      <ScanLine className="size-4" />
                      Camera
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Leitor USB funciona como teclado: clique no campo, passe o
                    produto e pressione Enter se o leitor nao enviar sozinho.
                  </p>
                </div>

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
                <div className="block">
                  <label
                    htmlFor="product-search"
                    className="text-brand-navy mb-2 block text-sm font-medium"
                  >
                    Pesquisar produto
                  </label>
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="product-search"
                      type="search"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Nome, categoria ou código"
                      autoComplete="off"
                      className="focus:border-brand-orange h-12 w-full rounded-xl border bg-white pr-4 pl-11 text-sm transition outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                  <label htmlFor="product-id" className="sr-only">
                    Produto
                  </label>
                  <select
                    id="product-id"
                    value={selectedProduct?.id ?? ''}
                    onChange={(event) => setProductId(event.target.value)}
                    disabled={filteredProducts.length === 0}
                    className="focus:border-brand-orange mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm transition outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {filteredProducts.length === 0 ? (
                      <option value="">Nenhum produto encontrado</option>
                    ) : (
                      filteredProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {getProductPublicName(product)}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredProducts.length}{' '}
                    {filteredProducts.length === 1
                      ? 'produto encontrado'
                      : 'produtos encontrados'}
                  </p>
                </div>
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
                  <span className="text-brand-navy mb-2 block text-sm font-medium">
                    Pagamento
                  </span>
                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="focus:border-brand-orange h-12 w-full rounded-xl border bg-white px-4 text-sm transition outline-none focus:ring-4 focus:ring-orange-100"
                  >
                    <option>Pix</option>
                    <option>Cartão de crédito</option>
                    <option>Cartão de débito</option>
                    <option>Dinheiro</option>
                  </select>
                </label>
                <label htmlFor="order-notes" className="block md:col-span-2">
                  <span className="text-brand-navy mb-2 block text-sm font-medium">
                    Observações
                  </span>
                  <textarea
                    id="order-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="focus:border-brand-orange min-h-24 w-full rounded-xl border bg-white px-4 py-3 text-sm transition outline-none focus:ring-4 focus:ring-orange-100"
                    placeholder="Cor, tamanho, prazo combinado ou detalhe do cliente"
                  />
                </label>
              </div>

              {submitMessage && (
                <p className="text-brand-navy mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
                  {submitMessage}
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  name="intent"
                  value="quote"
                  disabled={saving}
                  className="text-brand-navy hover:border-brand-orange hover:text-brand-orange inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold transition disabled:opacity-50"
                >
                  <FileText className="size-4" />
                  Gerar orçamento
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="sale"
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saving ? 'Salvando...' : 'Confirmar venda'}
                </button>
              </div>
            </form>

            <aside className="rounded-2xl border bg-white p-6">
              <div className="flex items-center gap-3">
                <ReceiptText className="text-brand-orange size-6" />
                <h2 className="text-brand-navy text-lg font-bold">
                  Comprovante
                </h2>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Cliente</span>
                  <strong className="text-brand-navy text-right">
                    {customerName || 'Não informado'}
                  </strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Produto</span>
                  <strong className="text-brand-navy text-right">
                    {selectedProduct
                      ? getProductPublicName(selectedProduct)
                      : 'Selecione um produto'}
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
                  <div className="text-brand-navy flex justify-between gap-4 text-xl font-bold">
                    <span>Total</span>
                    <span>{currency.format(total)}</span>
                  </div>
                </div>
              </div>
              {activeCoupon && (
                <p className="text-brand-orange mt-5 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold">
                  Cupom {activeCoupon.code} aplicado.
                </p>
              )}
              <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="size-4" />
                Ao gerar o pedido, o front envia sinal de venda confirmada e
                baixa de estoque para o backend.
              </p>
            </aside>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-brand-navy flex items-center gap-2 text-xl font-bold">
            <FileText className="text-brand-orange size-5" />
            Últimos orçamentos e vendas
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {orders.slice(0, 6).map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`mb-2 inline-flex rounded-full px-2 py-1 text-[9px] font-black tracking-wide uppercase ${
                        order.kind === 'ORCAMENTO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {order.kind === 'ORCAMENTO' ? 'Orçamento' : 'Venda'}
                    </span>
                    <h3 className="text-brand-navy font-bold">
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
        <BarcodeScannerModal
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={selectProductFromBarcode}
        />
      </main>
    </DashboardLayout>
  )
}
