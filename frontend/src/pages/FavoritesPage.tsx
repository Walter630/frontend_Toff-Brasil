import { Heart, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ProductCard } from '../components/catalog/ProductCard'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../lib/api-error'
import { favoriteService } from '../services/favorite-service'
import type { Product } from '../types/product'

export function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState('')
  const [message, setMessage] = useState('')

  async function loadFavorites() {
    setLoading(true)
    setMessage('')

    try {
      setProducts(await favoriteService.list())
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel carregar favoritos.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(productId: string) {
    setRemovingId(productId)
    setMessage('')

    try {
      await favoriteService.remove(productId)
      setProducts((current) =>
        current.filter((product) => product.id !== productId),
      )
      setMessage('Produto removido dos favoritos.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel remover favorito.'))
    } finally {
      setRemovingId('')
    }
  }

  useEffect(() => {
    void loadFavorites()
  }, [])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Catalogo pessoal
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Favoritos
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Produtos salvos pelo usuario no backend.
            </p>
          </div>
          <Button variant="secondary" onClick={() => void loadFavorites()}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-72 place-items-center rounded-2xl border bg-white">
            <LoaderCircle className="size-9 animate-spin text-brand-orange" />
          </div>
        ) : products.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <button
                  type="button"
                  onClick={() => void handleRemove(product.id)}
                  disabled={removingId === product.id}
                  className="absolute bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-xl border border-red-100 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Remover favorito"
                >
                  {removingId === product.id ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-14 text-center">
            <Heart className="mx-auto size-9 text-slate-300" />
            <p className="mt-4 font-semibold text-brand-navy">
              Nenhum favorito encontrado
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Quando o backend retornar favoritos, eles aparecem aqui.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
