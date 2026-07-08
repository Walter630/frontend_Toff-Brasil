import type { FormEvent } from 'react'

import { BadgePercent, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { couponService, type DiscountCoupon } from '../services/coupon-service'

export function CouponsPage() {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(couponService.list)
  const [code, setCode] = useState('')
  const [percentage, setPercentage] = useState('10')
  const [minimumOrder, setMinimumOrder] = useState('0')
  const [description, setDescription] = useState('')

  const persistCoupons = (nextCoupons: DiscountCoupon[]) => {
    setCoupons(nextCoupons)
    couponService.save(nextCoupons)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedPercentage = Number(percentage)
    const parsedMinimumOrder = Number(minimumOrder)

    if (!code.trim() || parsedPercentage <= 0 || parsedPercentage > 90) {
      return
    }

    persistCoupons([
      {
        id: crypto.randomUUID(),
        code: code.trim().toUpperCase(),
        percentage: parsedPercentage,
        minimumOrder: Number.isFinite(parsedMinimumOrder)
          ? parsedMinimumOrder
          : 0,
        active: true,
        description: description.trim() || 'Cupom de desconto Toff Brasil.',
      },
      ...coupons,
    ])
    setCode('')
    setPercentage('10')
    setMinimumOrder('0')
    setDescription('')
  }

  const toggleCoupon = (id: string) => {
    persistCoupons(
      coupons.map((coupon) =>
        coupon.id === id ? { ...coupon, active: !coupon.active } : coupon,
      ),
    )
  }

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Descontos
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Cupons promocionais
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Cadastre códigos para aplicar no pedido presencial e acompanhar
              campanhas ativas.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border bg-white px-5 py-4">
            <BadgePercent className="size-5 text-brand-orange" />
            <div>
              <p className="text-2xl font-bold text-brand-navy">
                {coupons.filter((coupon) => coupon.active).length}
              </p>
              <p className="text-xs text-slate-500">cupons ativos</p>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border bg-white p-6"
          >
            <h2 className="text-lg font-bold text-brand-navy">Novo cupom</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input
                id="coupon-code"
                label="Código"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="EX.: CLIENTE10"
              />
              <Input
                id="coupon-percentage"
                label="Desconto (%)"
                type="number"
                min={1}
                max={90}
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
              />
              <Input
                id="coupon-minimum"
                label="Pedido mínimo (R$)"
                type="number"
                min={0}
                step="0.01"
                value={minimumOrder}
                onChange={(event) => setMinimumOrder(event.target.value)}
              />
              <Input
                id="coupon-description"
                label="Descrição"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Campanha ou regra interna"
              />
            </div>
            <Button type="submit" className="mt-5 w-full">
              <Plus className="size-4" />
              Cadastrar cupom
            </Button>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {coupons.map((coupon) => (
              <article key={coupon.id} className="rounded-2xl border bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Código
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-brand-navy">
                      {coupon.code}
                    </h3>
                  </div>
                  <button
                    aria-label={
                      coupon.active ? 'Desativar cupom' : 'Ativar cupom'
                    }
                    onClick={() => toggleCoupon(coupon.id)}
                    className="rounded-xl p-2 text-brand-orange hover:bg-orange-50"
                  >
                    {coupon.active ? (
                      <ToggleRight className="size-7" />
                    ) : (
                      <ToggleLeft className="size-7 text-slate-400" />
                    )}
                  </button>
                </div>
                <p className="mt-4 text-4xl font-bold text-brand-orange">
                  {coupon.percentage}%
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {coupon.description}
                </p>
                <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Pedido mínimo: R$ {coupon.minimumOrder.toFixed(2)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
