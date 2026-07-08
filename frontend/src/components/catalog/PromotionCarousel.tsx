import { ChevronLeft, ChevronRight, Tag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import type { Product } from '../../types/product'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type PromotionCarouselProps = {
  products: Product[]
}

function getPromotion(product: Product, index: number) {
  const discount = [10, 15, 20, 25][index % 4]
  const promotionalPrice = product.price * (1 - discount / 100)

  return { discount, promotionalPrice }
}

export function PromotionCarousel({ products }: PromotionCarouselProps) {
  const promotedProducts = useMemo(
    () => products.filter((product) => product.ativo).slice(0, 6),
    [products],
  )
  const [activeIndex, setActiveIndex] = useState(0)

  if (!promotedProducts.length) {
    return null
  }

  const product = promotedProducts[activeIndex]
  const { discount, promotionalPrice } = getPromotion(product, activeIndex)

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? promotedProducts.length - 1 : current - 1,
    )
  }

  const goToNext = () => {
    setActiveIndex((current) =>
      current === promotedProducts.length - 1 ? 0 : current + 1,
    )
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border bg-white">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-80 overflow-hidden bg-brand-navy">
          <div className="absolute inset-0 bg-white/5" />
          <img
            src={product.image}
            alt=""
            className="absolute inset-y-8 right-8 hidden h-[calc(100%-4rem)] w-72 rounded-2xl bg-white object-contain p-5 opacity-90 shadow-2xl md:block"
            onError={(event) => {
              event.currentTarget.src = '/products/dragao-articulado.webp'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/30" />
          <div className="relative flex min-h-80 flex-col justify-end p-6 text-white sm:p-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
              <Tag className="size-3.5" />
              {discount}% off
            </span>
            <h2 className="mt-4 max-w-xl text-3xl font-bold sm:text-4xl">
              {product.name}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-blue-50/80">
              {product.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Promoções em destaque
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Produtos selecionados para ofertas rápidas no atendimento e no
              catálogo.
            </p>
            <div className="mt-6">
              <p className="text-sm text-slate-400 line-through">
                {currency.format(product.price)}
              </p>
              <p className="text-3xl font-bold text-brand-navy">
                {currency.format(promotionalPrice)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {product.estoque} unidades em estoque
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={`/produtos/${product.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
            >
              Ver produto
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <button
                aria-label="Promoção anterior"
                onClick={goToPrevious}
                className="grid size-11 place-items-center rounded-xl border text-brand-navy hover:bg-slate-50"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Próxima promoção"
                onClick={goToNext}
                className="grid size-11 place-items-center rounded-xl border text-brand-navy hover:bg-slate-50"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {promotedProducts.map((item, index) => (
              <button
                key={item.id}
                aria-label={`Abrir promoção ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={
                  index === activeIndex
                    ? 'h-2 w-8 rounded-full bg-brand-orange'
                    : 'h-2 w-2 rounded-full bg-slate-300'
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
