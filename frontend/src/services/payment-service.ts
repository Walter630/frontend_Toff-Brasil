import { api } from '../lib/api'

export type PaymentMethod = 'PIX'

export type PaymentMethodOption = {
  value: PaymentMethod
  label: string
  description: string
}

export type PaymentCreatePayload = {
  pedidoId: string
  formaPagamento: PaymentMethod
  valor: number
}

export type PaymentResponse = {
  id: string
  status: string
  formaPagamento: PaymentMethod
  valorTotal?: number
  pixCopiaECola?: string
  qrCodeUrl?: string
  paymentUrl?: string
  message?: string
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: 'PIX',
    label: 'Pix',
    description: 'Aprovacao rapida com QR Code ou copia e cola.',
  },
]

function normalizePaymentResponse(data: unknown): PaymentResponse {
  const payment = getPaymentObject(data)
  const explicitPixCopiaECola = getString(payment, [
    'pixCopiaECola',
    'copiaECola',
    'pixCopyPaste',
    'copyPaste',
    'codigoPix',
    'codigoPagamento',
    'brCode',
    'payload',
    'qrCodeText',
    'qrCodePayload',
    'emv',
  ])
  const qrCodeValue = getString(payment, [
    'qrCodeUrl',
    'qrCode',
    'qrcode',
    'qr_code',
    'qrCodeBase64',
    'qrCodeImage',
    'imagemQrCode',
    'imagemQrcode',
    'image',
  ])
  const pixCopiaECola =
    explicitPixCopiaECola ??
    (isQrCodeImage(qrCodeValue) ? undefined : qrCodeValue)

  return {
    id: String(payment.id ?? ''),
    status: String(payment.status ?? payment.situacao ?? 'PROCESSADO'),
    formaPagamento: String(
      payment.formaPagamento ?? payment.metodoPagamento ?? payment.method ?? 'PIX',
    ) as PaymentMethod,
    valorTotal:
      payment.valorTotal !== undefined
        ? Number(payment.valorTotal)
        : payment.valor !== undefined
          ? Number(payment.valor)
          : undefined,
    pixCopiaECola,
    qrCodeUrl: normalizeQrCodeImage(qrCodeValue, pixCopiaECola),
    paymentUrl:
      typeof payment.paymentUrl === 'string'
        ? payment.paymentUrl
        : typeof payment.urlPagamento === 'string'
          ? payment.urlPagamento
          : undefined,
    message:
      typeof payment.message === 'string'
        ? payment.message
        : typeof payment.mensagem === 'string'
          ? payment.mensagem
          : undefined,
  }
}

function getPaymentObject(data: unknown): Record<string, unknown> {
  const root = (data && typeof data === 'object' ? data : {}) as Record<
    string,
    unknown
  >
  const nested =
    root.data ?? root.response ?? root.pagamento ?? root.payment ?? root.result

  if (nested && typeof nested === 'object') {
    return {
      ...root,
      ...(nested as Record<string, unknown>),
    }
  }

  return root
}

function getString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

function isQrCodeImage(qrCodeValue?: string) {
  if (qrCodeValue?.startsWith('http')) {
    return true
  }

  if (qrCodeValue?.startsWith('data:image')) {
    return true
  }

  return Boolean(
    qrCodeValue &&
      (qrCodeValue.startsWith('iVBOR') ||
        qrCodeValue.startsWith('/9j/') ||
        qrCodeValue.startsWith('R0lGOD')),
  )
}

function normalizeQrCodeImage(qrCodeValue?: string, pixCopiaECola?: string) {
  if (qrCodeValue?.startsWith('http')) {
    return qrCodeValue
  }

  if (qrCodeValue?.startsWith('data:image')) {
    return qrCodeValue
  }

  if (
    qrCodeValue &&
    (qrCodeValue.startsWith('iVBOR') ||
      qrCodeValue.startsWith('/9j/') ||
      qrCodeValue.startsWith('R0lGOD'))
  ) {
    return `data:image/png;base64,${qrCodeValue}`
  }

  if (pixCopiaECola) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      pixCopiaECola,
    )}`
  }

  return undefined
}

export const paymentService = {
  async listMethods() {
    return paymentMethods
  },

  async createPayment(payload: PaymentCreatePayload) {
    const { data } = await api.post('/pagamentoitems/FormaPayment', payload)
    return normalizePaymentResponse(data)
  },
}
