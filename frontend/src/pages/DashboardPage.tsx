import { useEffect, useMemo, useState } from 'react'

import {
  CatalogFilterPanel,
  type DetailFilterGroup,
} from '../components/catalog/CatalogFilterPanel'
import { CatalogState } from '../components/catalog/CatalogState'
import { ProductCard } from '../components/catalog/ProductCard'
import { ProductPagination } from '../components/catalog/ProductPagination'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useProducts } from '../hooks/useProducts'
import {
  filterProductsByDetails,
  productBrandOptions,
  productMaterialOptions,
  productTypeOptions,
  type ProductFilterValue,
} from '../lib/product-filters'
import { productCategoryOptions } from '../services/product-service'

const categories = [{ label: 'Todos', value: 'Todos' }, ...productCategoryOptions]
const pageSize = 12

export function DashboardPage() {
  const [category, setCategory] = useState('Todos')
  const [material, setMaterial] = useState<ProductFilterValue>('Todos')
  const [brand, setBrand] = useState<ProductFilterValue>('Todos')
  const [type, setType] = useState<ProductFilterValue>('Todos')
  const [page, setPage] = useState(1)

  // O backend recebe os filtros pelos mesmos nomes definidos em ProductQueryFilter.
  const filters = useMemo(
    () => ({
      categoria:
        category !== 'Todos'
          ? category
          : material !== 'Todos'
            ? 'FILAMENTOS'
            : undefined,
    }),
    [category, material],
  )
  const { products, loading, error, reload } = useProducts(filters)
  const visibleProducts = useMemo(
    () => filterProductsByDetails(products, material, brand, type),
    [brand, material, products, type],
  )
  const detailFilterGroups: DetailFilterGroup[] = [
    {
      label: 'Material',
      value: material,
      onChange: setMaterial,
      options: productMaterialOptions,
    },
    {
      label: 'Marca',
      value: brand,
      onChange: setBrand,
      options: productBrandOptions,
    },
    {
      label: 'Tipo',
      value: type,
      onChange: setType,
      options: productTypeOptions,
    },
  ]
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize))
  const paginatedProducts = visibleProducts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  )
  const resetFilters = () => {
    setCategory('Todos')
    setMaterial('Todos')
    setBrand('Todos')
    setType('Todos')
  }

  useEffect(() => {
    setPage(1)
  }, [brand, category, material, type])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <section>
          <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-orange">
                Catalogo Toff Brasil
              </p>
              <h1 className="mt-1 text-3xl font-bold text-brand-navy">
                Produtos disponiveis
              </h1>
              {!loading && !error && (
                <p className="mt-2 text-sm text-slate-500">
                  {visibleProducts.length} produtos encontrados
                </p>
              )}
            </div>
            <img
              src="/brand/logo-toffbr.jpeg"
              alt="Toff Brasil"
              className="h-16 w-fit max-w-44 rounded-xl bg-white object-contain p-2 shadow-sm ring-1 ring-slate-200"
            />
          </div>
          <CatalogFilterPanel
            category={category}
            categories={categories}
            detailGroups={detailFilterGroups}
            resultCount={visibleProducts.length}
            onCategoryChange={setCategory}
            onReset={resetFilters}
          />

          <div className="mt-6">
            {loading || error ? (
              <CatalogState
                loading={loading}
                error={error}
                onRetry={() => void reload()}
              />
            ) : visibleProducts.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-white p-14 text-center text-slate-500">
                Nenhum produto encontrado para esses filtros.
              </div>
            )}
            <ProductPagination
              page={page}
              totalPages={totalPages}
              totalItems={visibleProducts.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
