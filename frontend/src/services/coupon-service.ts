import { api } from '../lib/api'

export type DiscountCoupon = {
  id: string
  code: string
  percentage: number
  minimumOrder: number
  active: boolean
  description: string
}

const defaultCoupons: DiscountCoupon[] = [
  {
    id: 'toff10',
    code: 'TOFF10',
    percentage: 10,
    minimumOrder: 50,
    active: true,
    description: 'Desconto para primeira compra presencial.',
  },
  {
    id: 'peca15',
    code: 'PECA15',
    percentage: 15,
    minimumOrder: 120,
    active: true,
    description: 'Campanha para pecas decorativas e organizadores.',
  },
]

function normalizeCoupon(data: unknown): DiscountCoupon {
  const coupon = (data && typeof data === 'object' ? data : {}) as Record<
    string,
    unknown
  >

  return {
    id: String(coupon.id ?? coupon.code ?? coupon.codigo ?? crypto.randomUUID()),
    code: String(coupon.code ?? coupon.codigo ?? ''),
    percentage: Number(coupon.percentage ?? coupon.percentual ?? 0),
    minimumOrder: Number(coupon.minimumOrder ?? coupon.pedidoMinimo ?? 0),
    active: Boolean(coupon.active ?? coupon.ativo ?? true),
    description: String(coupon.description ?? coupon.descricao ?? ''),
  }
}

function normalizeCouponsResponse(data: unknown) {
  const coupons = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
      ? (data as Record<string, unknown>).coupons ??
        (data as Record<string, unknown>).cupons ??
        (data as Record<string, unknown>).content ??
        (data as Record<string, unknown>).data
      : []

  return Array.isArray(coupons) ? coupons.map(normalizeCoupon) : []
}

export const couponService = {
  async list() {
    const { data } = await api.get('/cupons')
    const coupons = normalizeCouponsResponse(data)
    return coupons.length ? coupons : defaultCoupons
  },

  async create(coupon: Omit<DiscountCoupon, 'id'>) {
    const { data } = await api.post('/cupons', coupon)
    return normalizeCoupon(data)
  },

  async update(coupon: DiscountCoupon) {
    const { data } = await api.put(
      `/cupons/${encodeURIComponent(coupon.id)}`,
      coupon,
    )

    return normalizeCoupon(data)
  },

  defaultCoupons() {
    return defaultCoupons
  },
}
