import {
  ArrowLeft,
  BadgeCheck,
  BellRing,
  Copy,
  CreditCard,
  LoaderCircle,
  QrCode,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../lib/api-error'
import { stripBrandFromName } from '../lib/product-display'
import { cartService } from '../services/cart-service'
import { notificationService } from '../services/notification-service'
import {
  paymentService,
  type PaymentMethod,
  type PaymentMethodOption,
  type PaymentResponse,
} from '../services/payment-service'
import type { CartItemResponse, CartResponse } from '../types/cart'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function getItemProduct(item: CartItemResponse) {
  return item.product ?? item.produto
}

function getItemTitle(item: CartItemResponse, index: number) {
  const title =
    item.name ??
    getItemProduct(item)?.name ??
    item.productId ??
    item.produtoId ??
    `Item ${index + 1}`

  return stripBrandFromName(title)
}

function getItemQuantity(item: CartItemResponse) {
  return item.quantity ?? item.quantidade ?? 1
}

function getItemUnitPrice(item: CartItemResponse) {
  return (
    item.unitPrice ??
    item.precoUnitario ??
    item.price ??
    getItemProduct(item)?.price ??
    0
  )
}

function getItemTotal(item: CartItemResponse) {
  return item.total ?? item.subtotal ?? getItemUnitPrice(item) * getItemQuantity(item)
}

function getCartTotal(cart: CartResponse) {
  const itemsTotal = cart.items.reduce(
    (total, item) => total + getItemTotal(item),
    0,
  )

  return cart.valorTotal > 0 ? cart.valorTotal : itemsTotal
}

function normalizeStatus(status: string) {
  return status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

function isPaidStatus(status: string) {
  const normalizedStatus = normalizeStatus(status)

  return [
    'PAGO',
    'PAGA',
    'APROVADO',
    'APROVADA',
    'CONFIRMADO',
    'CONFIRMADA',
    'CONCLUIDO',
    'CONCLUIDA',
    'PAID',
    'APPROVED',
  ].some((paidStatus) => normalizedStatus.includes(paidStatus))
}

export function CheckoutPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [methods, setMethods] = useState<PaymentMethodOption[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PIX')
  const [installments, setInstallments] = useState('1')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [message, setMessage] = useState('')
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [notifyingManager, setNotifyingManager] = useState(false)
  const [managerAlertSent, setManagerAlertSent] = useState(false)

  const total = useMemo(() => (cart ? getCartTotal(cart) : 0), [cart])
  const selectedMethodInfo = methods.find(
    (method) => method.value === selectedMethod,
  )

  async function loadCheckout() {
    setLoading(true)
    setMessage('')

    try {
      const [cartData, methodData] = await Promise.all([
        cartService.getMyCart(),
        paymentService.listMethods(),
      ])

      setCart(cartData)
      setMethods(methodData)
      setSelectedMethod(methodData[0]?.value ?? 'PIX')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel carregar checkout.'))
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment() {
    if (!cart) {
      return
    }

    setPaying(true)
    setMessage('')
    setPayment(null)
    setManagerAlertSent(false)

    try {
      const response = await paymentService.createPayment({
        pedidoId: cart.id,
        formaPagamento: selectedMethod,
        valor: total,
      })

      setPayment(response)

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl
        return
      }

      if (isPaidStatus(response.status)) {
        const managerNotified = await notifyManager(response)
        setMessage(
          managerNotified
            ? 'Pagamento confirmado e gerente notificado sobre a venda.'
            : 'Pagamento confirmado, mas nao foi possivel notificar o gerente.',
        )
        return
      }

      setMessage(
        response.message ??
          'Pix gerado. O gerente deve ser avisado quando o backend confirmar o pagamento.',
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel criar pagamento.'))
    } finally {
      setPaying(false)
    }
  }

  async function copyPixCode() {
    if (!payment?.pixCopiaECola) {
      return
    }

    await navigator.clipboard.writeText(payment.pixCopiaECola)
    setMessage('Codigo Pix copiado.')
  }

  async function notifyManager(paymentData = payment) {
    if (!cart || !paymentData || managerAlertSent) {
      return managerAlertSent
    }

    setNotifyingManager(true)
    setMessage('')

    try {
      const itemLines = cart.items.map(
        (item, index) =>
          `- ${getItemQuantity(item)}x ${getItemTitle(item, index)} (${currency.format(
            getItemTotal(item),
          )})`,
      )

      await notificationService.create({
        title: `Venda Pix ${paymentData.status}`,
        description: [
          `Pedido/carrinho: ${cart.id}`,
          paymentData.id ? `Pagamento: ${paymentData.id}` : '',
          `Metodo: ${paymentData.formaPagamento}`,
          `Total: ${currency.format(paymentData.valorTotal ?? total)}`,
          'Produtos:',
          ...itemLines,
        ]
          .filter(Boolean)
          .join('\n'),
      })

      setManagerAlertSent(true)
      setMessage('Gerente notificado sobre esta venda.')
      return true
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, 'Nao foi possivel notificar o gerente.'),
      )
      return false
    } finally {
      setNotifyingManager(false)
    }
  }

  useEffect(() => {
    void loadCheckout()
  }, [])

  return (
    <DashboardLayout>
      <main className="px-4 py-5 sm:p-8">
        <Link
          to="/carrinho"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange"
        >
          <ArrowLeft className="size-4" />
          Voltar ao carrinho
        </Link>

        <div className="mt-5 overflow-hidden rounded-3xl bg-brand-navy p-5 text-white shadow-xl shadow-slate-200 sm:p-7">
          <p className="text-sm font-semibold text-orange-200">Finalizacao</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Pagamento</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/75">
                Escolha a forma de pagamento e confirme sua compra com
                seguranca.
              </p>
            </div>
            <div className="w-fit rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-blue-100/70">Total</p>
              <strong className="text-2xl text-white">
                {currency.format(total)}
              </strong>
            </div>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-72 place-items-center rounded-2xl border bg-white">
            <LoaderCircle className="size-9 animate-spin text-brand-orange" />
          </div>
        ) : cart && cart.items.length ? (
          <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-brand-navy">
                    Metodo de pagamento
                  </h2>
                  <p className="text-xs text-slate-500">
                    Rotas integradas ao backend
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {methods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedMethod(method.value)}
                    className={
                      selectedMethod === method.value
                        ? 'rounded-2xl border-2 border-brand-orange bg-orange-50 p-4 text-left shadow-sm'
                        : 'rounded-2xl border bg-white p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/40'
                    }
                  >
                    <span className="font-bold text-brand-navy">
                      {method.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {method.description}
                    </span>
                  </button>
                ))}
              </div>

              {selectedMethod === 'CARTAO_CREDITO' && (
                <label htmlFor="installments" className="mt-5 block">
                  <span className="mb-2 block text-sm font-medium text-brand-navy">
                    Parcelas
                  </span>
                  <select
                    id="installments"
                    value={installments}
                    onChange={(event) => setInstallments(event.target.value)}
                    className="h-12 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-brand-navy outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                  >
                    {Array.from({ length: 6 }, (_, index) => index + 1).map(
                      (installment) => (
                        <option key={installment} value={installment}>
                          {installment}x de {currency.format(total / installment)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              )}

              <label htmlFor="payment-notes" className="mt-5 block">
                <span className="mb-2 block text-sm font-medium text-brand-navy">
                  Observacao
                </span>
                <textarea
                  id="payment-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Opcional: retirada, entrega, referencia ou combinados."
                  className="min-h-28 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <Button
                className="mt-5 h-12 w-full"
                onClick={() => void handlePayment()}
                disabled={paying}
              >
                {paying ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CreditCard className="size-4" />
                )}
                {paying ? 'Enviando...' : 'Confirmar pagamento'}
              </Button>

              {payment && (
                <section className="mt-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg shadow-orange-100/60">
                  <div className="flex flex-col gap-3 bg-brand-navy px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid size-12 place-items-center rounded-2xl bg-brand-orange text-white shadow-sm">
                        <QrCode className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">
                          Pix gerado com sucesso
                        </h3>
                        <p className="text-xs text-blue-100/75">
                          Escaneie ou copie o codigo abaixo
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15">
                      <BadgeCheck className="size-4 text-emerald-300" />
                      {payment.status}
                    </span>
                  </div>

                  <div className="grid gap-5 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-orange">
                        Escaneie este QR Code
                      </p>
                      {payment.qrCodeUrl ? (
                        <img
                          src={payment.qrCodeUrl}
                          alt="QR Code Pix"
                          className="mx-auto aspect-square w-full max-w-56 rounded-2xl object-contain"
                        />
                      ) : (
                        <div className="mx-auto grid aspect-square w-full max-w-56 place-items-center rounded-2xl bg-slate-50 text-slate-300">
                          <QrCode className="size-20" />
                        </div>
                      )}
                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        Valor: {currency.format(payment.valorTotal ?? total)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                          <p className="text-[11px] font-bold uppercase text-slate-400">
                            1. Abra
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            Entre no app do seu banco.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                          <p className="text-[11px] font-bold uppercase text-slate-400">
                            2. Pix
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            Escaneie o QR ou use copia e cola.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                          <p className="text-[11px] font-bold uppercase text-slate-400">
                            3. Confirme
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            Aguarde a confirmacao do pagamento.
                          </p>
                        </div>
                      </div>

                      {payment.pixCopiaECola ? (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="flex items-center gap-2 text-sm font-bold text-brand-navy">
                              <Copy className="size-4 text-brand-orange" />
                              Pix copia e cola
                            </p>
                            <span className="hidden rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-100 sm:inline-flex">
                              Codigo seguro
                            </span>
                          </div>
                          <div className="rounded-2xl bg-slate-950 p-3 shadow-sm ring-1 ring-slate-800">
                            <code className="block max-h-28 overflow-auto break-all text-xs leading-5 text-slate-100">
                              {payment.pixCopiaECola}
                            </code>
                          </div>
                          <Button
                            className="mt-3 h-12 w-full"
                            onClick={() => void copyPixCode()}
                          >
                            <Copy className="size-4" />
                            Copiar codigo Pix
                          </Button>
                        </div>
                      ) : (
                        selectedMethod === 'PIX' && (
                          <p className="mt-4 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm leading-6 text-brand-navy">
                            O backend confirmou o pagamento como{' '}
                            <strong>{payment.status}</strong>, mas nao retornou
                            QR Code nem Pix copia e cola. Confira se o
                            `ResponseDTO` esta enviando algum campo como
                            `pixCopiaECola`, `copiaECola`, `codigoPix`,
                            `qrCode`, `qrCodeUrl` ou `payload`.
                          </p>
                        )
                      )}

                      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs text-slate-500 ring-1 ring-slate-100">
                        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                        Pagamento processado pelo backend da Toff Brasil.
                      </div>

                      <div className="mt-4 rounded-2xl border border-orange-100 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                            <BellRing className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-brand-navy">
                              Aviso para o gerente
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {isPaidStatus(payment.status)
                                ? 'Esse pagamento ja veio confirmado pelo backend, entao o aviso pode ser enviado com seguranca.'
                                : 'Esse Pix ainda nao veio como pago. Em producao, o ideal e o backend avisar automaticamente depois da confirmacao do Pix.'}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="mt-3 h-11 w-full"
                          variant={managerAlertSent ? 'secondary' : 'primary'}
                          disabled={notifyingManager || managerAlertSent}
                          onClick={() => void notifyManager()}
                        >
                          {notifyingManager ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <BellRing className="size-4" />
                          )}
                          {managerAlertSent
                            ? 'Gerente avisado'
                            : 'Avisar gerente'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <ReceiptText className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-brand-navy">Resumo</h2>
                  <p className="text-xs text-slate-500">
                    {cart.items.length} produto(s)
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t pt-5">
                {cart.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 text-slate-600">
                      {getItemQuantity(item)}x {getItemTitle(item, index)}
                    </span>
                    <strong className="shrink-0 text-brand-navy">
                      {currency.format(getItemTotal(item))}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t pt-5">
                <span className="font-semibold text-brand-navy">Total</span>
                <strong className="text-2xl text-brand-orange">
                  {currency.format(total)}
                </strong>
              </div>

              {selectedMethodInfo && (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  Metodo selecionado: {selectedMethodInfo.label}.
                </p>
              )}
            </aside>
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-8 text-center text-slate-500">
            Seu carrinho esta vazio.
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
