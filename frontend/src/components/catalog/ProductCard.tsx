import { MessageCircle, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../lib/api-error'
import { savePendingCartProduct } from '../../lib/cart-auth'
import { getProductPublicName } from '../../lib/product-display'
import {
  getAvailabilityClasses,
  getProductAvailability,
} from '../../lib/product-status'
import { getProductWhatsappUrl } from '../../lib/whatsapp'
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
  const navigate = useNavigate()
  const [addingToCart, setAddingToCart] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAddToCart() {
    setMessage('')

    if (!authService.isAuthenticated()) {
      savePendingCartProduct(product.id)
      navigate('/login', { state: { from: '/carrinho' } })
      return
    }

    setAddingToCart(true)

    try {
      await cartService.addItem(product.id)
      setMessage('Produto adicionado ao carrinho.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel adicionar ao carrinho.'))
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/produtos/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-white p-3 sm:p-4">
          <img
            src={product.image}
            alt={publicName}
            className="size-full object-contain transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = '/products/dragao-articulado.webp'
            }}
          />
          {product.categoria !== 'Sem categoria' && (
            <span className="absolute left-3 top-3 rounded-full bg-brand-navy/90 px-3 py-1 text-[11px] font-semibold text-white sm:left-4 sm:top-4 sm:text-xs">
              {product.categoria}
            </span>
          )}
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ring-1 sm:right-4 sm:top-4 sm:text-xs ${getAvailabilityClasses(
              availability.tone,
            )}`}
          >
            {availability.label}
          </span>
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        <Link to={`/produtos/${product.id}`} className="block">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-brand-navy sm:text-lg">
            {publicName}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-9 text-sm text-slate-500 sm:min-h-10">
          {product.description}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3 sm:mt-5">
          <p className="text-lg font-bold text-brand-orange sm:text-xl">
            {currency.format(product.price)}
          </p>
          <p className="text-right text-xs text-slate-500">
            {availability.description}
          </p>
        </div>
        {availability.canContact && (
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={addingToCart}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark disabled:pointer-events-none disabled:opacity-60 sm:mt-5"
          >
            <ShoppingCart className="size-4" />
            {addingToCart ? 'Adicionando...' : 'Adicionar ao carrinho'}
          </button>
        )}
        {message && (
          <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-brand-navy">
            {message}
          </p>
        )}
        {availability.canContact ? (
          <a
            href={getProductWhatsappUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700 sm:mt-5"
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
