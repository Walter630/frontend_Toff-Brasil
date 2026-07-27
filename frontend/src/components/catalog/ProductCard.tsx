import {
  ArrowRight,
  Flame,
  MessageCircle,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../lib/api-error'
import { savePendingCartProduct } from '../../lib/cart-auth'
import { notifyCartUpdated } from '../../lib/cart-events'
import { localProductsEvent } from '../../lib/local-product-db'
import { getProductPublicName } from '../../lib/product-display'
import {
  getAvailabilityClasses,
  getProductAvailability,
} from '../../lib/product-status'
import {
  getProductRestockWhatsappUrl,
  getProductWhatsappUrl,
} from '../../lib/whatsapp'
import { authService } from '../../services/auth-service'
import { cartService } from '../../services/cart-service'
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
  const publicName = getProductPublicName(product)
  const isPreSale = product.status === 'PRE_VENDA'
  const navigate = useNavigate()
  const location = useLocation()
  const [addingToCart, setAddingToCart] = useState(false)
  const [message, setMessage] = useState('')
  const inheritedCatalogPath = (
    location.state as { catalogPath?: string } | null
  )?.catalogPath
  const catalogPath =
    location.pathname === '/catalogo'
      ? `${location.pathname}${location.search}`
      : inheritedCatalogPath
  const productLinkState = catalogPath ? { catalogPath } : undefined

  async function handleAddToCart() {
    setMessage('')

    if (!authService.isAuthenticated()) {
      savePendingCartProduct(product.id)
      navigate('/login', { state: { from: '/carrinho' } })
      return
    }

    setAddingToCart(true)

    try {
      const cart = await cartService.addItem(product.id)
      window.dispatchEvent(new Event(localProductsEvent))
      notifyCartUpdated({ cart, addedProductName: publicName })
      setMessage('Adicionado ao carrinho!')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel adicionar ao carrinho.'))
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_10px_32px_rgba(15,23,42,.08)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-[0_18px_40px_rgba(15,23,42,.13)]">
      {/* Image */}
      <Link
        to={`/produtos/${product.id}`}
        state={productLinkState}
        className="relative block overflow-hidden bg-white"
      >
        <div className="relative aspect-[1.08] overflow-hidden p-3 sm:p-4">
          <img
            src={product.image}
            alt={publicName}
            className={`size-full object-contain transition duration-700 group-hover:scale-105 ${
              availability.tone === 'neutral' ? 'opacity-45 grayscale-[25%]' : ''
            }`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = '/products/dragao-articulado.webp'
            }}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 hidden items-center justify-center bg-brand-navy/0 transition duration-300 group-hover:bg-brand-navy/5 sm:flex">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/0 px-4 py-2 text-xs font-extrabold text-brand-navy opacity-0 shadow-lg backdrop-blur-sm transition duration-300 group-hover:bg-white/95 group-hover:opacity-100">
              Ver detalhes
              <ArrowRight className="size-3.5" />
            </span>
          </div>

          {/* Out of stock overlay */}
          {availability.tone === 'neutral' && (
            <div className="pointer-events-none absolute inset-0 bg-slate-800/8">
              <p className="absolute right-0 bottom-0 left-0 bg-slate-800/90 py-2 text-center text-[10px] font-black tracking-[0.16em] text-white uppercase">
                Sem estoque
              </p>
            </div>
          )}
        </div>

        {isPreSale ? (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-brand-orange px-2.5 py-1.5 text-[9px] font-black tracking-wider text-white uppercase shadow-lg sm:top-3 sm:left-3">
            <Flame className="size-3" />
            Pré-venda
          </span>
        ) : availability.tone !== 'neutral' ? (
          <span
            className={`absolute right-2.5 top-2.5 rounded-md px-2 py-1 text-[9px] font-extrabold ring-1 sm:right-3 sm:top-3 ${getAvailabilityClasses(
              availability.tone,
            )}`}
          >
            {availability.label}
          </span>
        ) : null}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <Link
          to={`/produtos/${product.id}`}
          state={productLinkState}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-9 text-xs leading-snug font-bold text-slate-800 transition group-hover:text-slate-950 sm:text-sm">
            {isPreSale && (
              <span className="text-brand-orange">PRÉ-VENDA · </span>
            )}
            {publicName}
          </h3>
        </Link>
        <p className="mt-1.5 hidden line-clamp-1 text-[10px] leading-relaxed text-slate-500 xl:block">
          {product.description}
        </p>

        {/* Price + availability */}
        <div className="mt-auto pt-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-black text-slate-950 sm:text-base">
              {currency.format(product.price)}
            </p>
            <p className="flex items-center gap-1 text-[8px] font-bold text-slate-400 sm:text-[9px]">
              <Truck className="size-3 text-brand-aqua-dark" />
              {availability.tone === 'neutral'
                ? availability.description
                : 'Envio para todo o Brasil'}
            </p>
          </div>

          {/* Actions */}
          {availability.canContact && (
            <div className="mt-2.5 flex gap-1.5">
              <button
                type="button"
                onClick={() => void handleAddToCart()}
                disabled={addingToCart}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-2 text-[10px] font-extrabold text-white shadow-sm transition hover:bg-brand-orange disabled:pointer-events-none disabled:opacity-60"
              >
                <ShoppingCart className="size-4" />
                <span>
                  {addingToCart ? 'Adicionando...' : 'Comprar'}
                </span>
              </button>
              <a
                href={getProductWhatsappUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="hidden size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 sm:inline-flex"
                aria-label="Falar pelo WhatsApp"
              >
                <MessageCircle className="size-4" />
              </a>
            </div>
          )}
          {!availability.canContact && (
            <a
              href={getProductRestockWhatsappUrl(product)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-[10px] font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <MessageCircle className="size-4" />
              Consultar reposição
            </a>
          )}
          {message && (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
