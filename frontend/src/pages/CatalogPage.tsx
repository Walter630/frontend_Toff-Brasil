import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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

const pageSize = 12
type SelectOption = { label: string; value: string }
const allOption = { label: 'Todos', value: 'Todos' } as const

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly SelectOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="group flex min-w-32 shrink-0 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 transition focus-within:border-brand-orange focus-within:ring-4 focus-within:ring-orange-100">
      <span className="text-[11px] font-bold uppercase text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 appearance-none bg-transparent text-sm font-bold text-brand-navy outline-none"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function CatalogPage() {
  const [material, setMaterial] = useState<ProductFilterValue>('Todos')
  const [brand, setBrand] = useState<ProductFilterValue>('Todos')
  const [type, setType] = useState<ProductFilterValue>('Todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const materialOptions = [allOption, ...productMaterialOptions]
  const brandOptions = [allOption, ...productBrandOptions]
  const typeOptions = [allOption, ...productTypeOptions]
  const filters = useMemo(
    () => ({
      name: search.trim() || undefined,
      categoria: material !== 'Todos' ? 'FILAMENTOS' : undefined,
    }),
    [material, search],
  )
  const { products, loading, error, reload } = useProducts(filters)
  const visibleProducts = useMemo(
    () => filterProductsByDetails(products, material, brand, type),
    [brand, material, products, type],
  )
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize))
  const paginatedProducts = visibleProducts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  )
  const hasActiveFilters =
    material !== 'Todos' ||
    brand !== 'Todos' ||
    type !== 'Todos' ||
    search.trim().length > 0
  const resetFilters = () => {
    setMaterial('Todos')
    setBrand('Todos')
    setType('Todos')
    setSearch('')
  }

  useEffect(() => {
    setPage(1)
  }, [brand, material, search, type])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return (
    <DashboardLayout>
      <main className="px-4 py-5 sm:p-8">
        <section className="mb-4 flex flex-col gap-3 sm:mb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-brand-orange">
              Catalogo
            </p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy sm:text-3xl">
              Filamentos da loja
            </h1>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy shadow-sm">
            <span className="flex size-2 rounded-full bg-brand-orange" />
            {visibleProducts.length} produto(s)
          </div>
        </section>

        <section className="sticky top-0 z-10 -mx-4 border-y border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:bg-white sm:p-3 sm:shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative block w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar filamento, cor ou codigo"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-brand-navy outline-none transition placeholder:text-slate-400 focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <div className="flex min-w-0 flex-1 items-stretch gap-2 overflow-x-auto pb-1 lg:justify-end lg:overflow-visible lg:pb-0">
              <FilterSelect
                label="Material"
                value={material}
                options={materialOptions}
                onChange={(value) => setMaterial(value as ProductFilterValue)}
              />
              <FilterSelect
                label="Marca"
                value={brand}
                options={brandOptions}
                onChange={(value) => setBrand(value as ProductFilterValue)}
              />
              <FilterSelect
                label="Tipo"
                value={type}
                options={typeOptions}
                onChange={(value) => setType(value as ProductFilterValue)}
              />
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:border-brand-orange hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="size-4" />
                Limpar
              </button>
            </div>
          </div>
        </section>

        <div className="mt-5">
          {loading || error ? (
            <CatalogState
              loading={loading}
              error={error}
              onRetry={() => void reload()}
            />
          ) : visibleProducts.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-slate-500 sm:p-14">
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
      </main>
    </DashboardLayout>
  )
}
