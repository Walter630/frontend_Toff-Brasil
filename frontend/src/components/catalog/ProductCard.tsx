import { MessageCircle, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  getAvailabilityClasses,
  getProductAvailability,
} from '../../lib/product-status'
import { getProductWhatsappUrl } from '../../lib/whatsapp'
import type { Product } from '../../types/product'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const availability = getProductAvailability(product)

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/produtos/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-white p-4">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-contain transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = '/products/dragao-articulado.webp'
            }}
          />
          {product.categoria !== 'Sem categoria' && (
            <span className="absolute left-4 top-4 rounded-full bg-brand-navy/90 px-3 py-1 text-xs font-semibold text-white">
              {product.categoria}
            </span>
          )}
          <span
            className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ring-1 ${getAvailabilityClasses(
              availability.tone,
            )}`}
          >
            {availability.label}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/produtos/${product.id}`} className="block">
          <h3 className="text-lg font-bold text-brand-navy">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">
          {product.description}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="text-xl font-bold text-brand-orange">
            {currency.format(product.price)}
          </p>
          <p className="text-right text-xs text-slate-500">
            {availability.description}
          </p>
        </div>
        {availability.canContact && (
          <button
            type="button"
            disabled
            title="Carrinho temporariamente indisponivel"
            className="mt-5 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500"
          >
            <ShoppingCart className="size-4" />
            Carrinho indisponivel
          </button>
        )}
        {availability.canContact ? (
          <a
            href={getProductWhatsappUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <MessageCircle className="size-4" />
            Falar com o gerente
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="mt-5 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500"
          >
            <MessageCircle className="size-4" />
            Indisponivel
          </button>
        )}
      </div>
    </article>
  )
}
