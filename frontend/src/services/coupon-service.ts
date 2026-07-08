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
    description: 'Campanha para peças decorativas e organizadores.',
  },
]

export const couponService = {
  list() {
    const stored = localStorage.getItem('toffbr:discount-coupons')

    if (!stored) {
      return defaultCoupons
    }

    try {
      return JSON.parse(stored) as DiscountCoupon[]
    } catch {
      return defaultCoupons
    }
  },

  save(coupons: DiscountCoupon[]) {
    localStorage.setItem('toffbr:discount-coupons', JSON.stringify(coupons))
  },
}
