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

const pageSize = 12

export function CatalogPage() {
  const [category, setCategory] = useState('Todos')
  const [material, setMaterial] = useState<ProductFilterValue>('Todos')
  const [brand, setBrand] = useState<ProductFilterValue>('Todos')
  const [type, setType] = useState<ProductFilterValue>('Todos')
  const [page, setPage] = useState(1)
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
  const categories = [{ label: 'Todos', value: 'Todos' }, ...productCategoryOptions]
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
        <h1 className="text-3xl font-bold text-brand-navy">Catálogo</h1>
        <p className="mt-2 text-sm text-slate-500">
          Consulte todos os produtos cadastrados no banco central.
        </p>

        <img
          src="/brand/logo-toffbr.jpeg"
          alt="Toff Brasil"
          className="mt-5 h-16 w-fit max-w-44 rounded-xl bg-white object-contain p-2 shadow-sm ring-1 ring-slate-200"
        />

        <CatalogFilterPanel
          category={category}
          categories={categories}
          detailGroups={detailFilterGroups}
          resultCount={visibleProducts.length}
          onCategoryChange={setCategory}
          onReset={resetFilters}
        />

        <div className="mt-8">
          {loading || error ? (
            <CatalogState
              loading={loading}
              error={error}
              onRetry={() => void reload()}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
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
      </main>
    </DashboardLayout>
  )
}
