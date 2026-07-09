import { useCallback, useEffect, useState } from 'react'

import { getApiErrorMessage } from '../lib/api-error'
import { localProductsEvent } from '../lib/local-product-db'
import { productService } from '../services/product-service'
import type { Product } from '../types/product'

type ProductFilters = {
  name?: string
  categoria?: string
  codigoBarras?: string
}

/**
 * Centraliza o ciclo de consulta de produtos para todas as páginas:
 * carregamento, resultado, erro e nova tentativa.
 */
export function useProducts(filters: ProductFilters = {}) {
  const name = filters.name
  const categoria = filters.categoria
  const codigoBarras = filters.codigoBarras
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
      setError('')
    }

    try {
      setProducts(await productService.list({ name, categoria, codigoBarras }))
    } catch (requestError) {
      if (!showLoading) {
        return
      }

      setError(
        getApiErrorMessage(
          requestError,
          'Não foi possível carregar os produtos.',
        ),
      )
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [categoria, codigoBarras, name])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const reloadSilently = () => {
      void reload(false)
    }

    window.addEventListener(localProductsEvent, reloadSilently)
    window.addEventListener('storage', reloadSilently)
    const intervalId = window.setInterval(() => {
      void reload(false)
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener(localProductsEvent, reloadSilently)
      window.removeEventListener('storage', reloadSilently)
    }
  }, [reload])

  return { products, loading, error, reload }
}
