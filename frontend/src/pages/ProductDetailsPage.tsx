import {
  ArrowLeft,
  LoaderCircle,
  MessageCircle,
  ShoppingCart,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { getApiErrorMessage } from '../lib/api-error'
import {
  getAvailabilityClasses,
  getProductAvailability,
} from '../lib/product-status'
import { localProductsEvent } from '../lib/local-product-db'
import { getProductWhatsappUrl } from '../lib/whatsapp'
import { productService } from '../services/product-service'
import type { Product } from '../types/product'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ProductDetailsPage() {
  const { id = '' } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const availability = product ? getProductAvailability(product) : null

  useEffect(() => {
    const loadProduct = (showLoading = true) => {
      if (showLoading) {
        setLoading(true)
      }
      productService
        .findById(id)
        .then(setProduct)
        .catch((error) => {
          if (showLoading) {
            setMessage(getApiErrorMessage(error))
          }
        })
        .finally(() => {
          if (showLoading) {
            setLoading(false)
          }
        })
    }
    const reloadSilently = () => loadProduct(false)

    loadProduct()
    window.addEventListener(localProductsEvent, reloadSilently)
    window.addEventListener('storage', reloadSilently)
    const intervalId = window.setInterval(reloadSilently, 5000)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener(localProductsEvent, reloadSilently)
      window.removeEventListener('storage', reloadSilently)
    }
  }, [id])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange"
        >
          <ArrowLeft className="size-4" />
          Voltar ao catalogo
        </Link>

        {loading ? (
          <LoaderCircle className="mx-auto mt-32 size-9 animate-spin text-brand-orange" />
        ) : product ? (
          <section className="mt-7 grid overflow-hidden rounded-3xl border bg-white lg:grid-cols-2">
            <div className="grid aspect-square place-items-center bg-white p-8">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={(event) => {
                  event.currentTarget.src = '/products/dragao-articulado.webp'
                }}
              />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-12">
              <p className="text-sm font-semibold text-brand-orange">
                {product.categoria}
              </p>
              {availability && (
                <span
                  className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getAvailabilityClasses(
                    availability.tone,
                  )}`}
                >
                  {availability.label}
                </span>
              )}
              <h1 className="mt-3 text-4xl font-bold text-brand-navy">
                {product.name}
              </h1>
              <p className="mt-5 leading-7 text-slate-500">
                {product.description}
              </p>
              <p className="mt-8 text-3xl font-bold text-brand-orange">
                {currency.format(product.price)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {availability?.description}
              </p>
              {message && (
                <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-brand-navy">
                  {message}
                </p>
              )}
              {availability?.canContact ? (
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled
                    title="Carrinho temporariamente indisponivel"
                    className="inline-flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-6 text-sm font-semibold text-slate-500"
                  >
                    <ShoppingCart className="size-4" />
                    Carrinho indisponivel
                  </button>
                  <a
                    href={getProductWhatsappUrl(product)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    <MessageCircle className="size-4" />
                    Falar com o gerente
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-7 inline-flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-6 text-sm font-semibold text-slate-500"
                >
                  <MessageCircle className="size-4" />
                  Indisponivel
                </button>
              )}
            </div>
          </section>
        ) : (
          <p className="mt-10 rounded-xl bg-red-50 p-5 text-red-700">
            {message || 'Produto nao encontrado.'}
          </p>
        )}
      </main>
    </DashboardLayout>
  )
}
