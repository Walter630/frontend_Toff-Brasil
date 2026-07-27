import {
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  Layers3,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { CatalogState } from '../components/catalog/CatalogState'
import { ProductCard } from '../components/catalog/ProductCard'
import { ProductPagination } from '../components/catalog/ProductPagination'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useProducts } from '../hooks/useProducts'
import { cn } from '../lib/cn'
import {
  filterProductsByDetails,
  filterProductsByGroup,
  productBrandOptions,
  productMaterialOptions,
  productTypeOptions,
  type ProductFilterValue,
  type ProductGroupFilterValue,
} from '../lib/product-filters'
import { getProductAvailability } from '../lib/product-status'
import {
  getProductBrand,
  getProductPublicName,
} from '../lib/product-display'
import type { Product } from '../types/product'

const pageSize = 12

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

function stockRank(product: Product) {
  if (product.status === 'PRE_VENDA') return 0
  const availability = getProductAvailability(product)
  if (availability.tone === 'available') return 1
  if (availability.canContact) return 2
  return 3
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const productsStartRef = useRef<HTMLDivElement>(null)
  const [productGroup, setProductGroup] =
    useState<ProductGroupFilterValue>('Todos')
  const [material, setMaterial] = useState<ProductFilterValue>('Todos')
  const [brand, setBrand] = useState<ProductFilterValue>('Todos')
  const [type, setType] = useState<ProductFilterValue>('Todos')
  const [search, setSearch] = useState(() => searchParams.get('busca') ?? '')
  const [preSaleOnly, setPreSaleOnly] = useState(
    () => searchParams.get('prevenda') === '1',
  )
  const [showUnavailable, setShowUnavailable] = useState(
    () => searchParams.get('esgotados') === '1',
  )
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const requestedSort = searchParams.get('ordenar')
    return requestedSort === 'price-asc' ||
      requestedSort === 'price-desc' ||
      requestedSort === 'name'
      ? requestedSort
      : 'featured'
  })
  const [page, setPage] = useState(1)
  const [showAllFacetTypes, setShowAllFacetTypes] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filters = useMemo(
    () => ({ name: search.trim() || undefined }),
    [search],
  )
  const { products, loading, error, reload } = useProducts(filters)

  useEffect(() => {
    const group = searchParams.get('grupo')
    let nextGroup: ProductGroupFilterValue = 'Todos'

    if (
      group === 'FILAMENTOS' ||
      group === 'ACESSORIOS' ||
      group === 'IMPRESSORAS'
    ) {
      nextGroup = group
    }

    const query = searchParams.get('busca')
    setSearch(query ?? '')

    const materialQuery = searchParams.get('material')
    let nextMaterial: ProductFilterValue = 'Todos'

    if (
      materialQuery === 'PLA' ||
      materialQuery === 'PETG' ||
      materialQuery === 'ABS' ||
      materialQuery === 'TPU'
    ) {
      nextGroup = 'FILAMENTOS'
      nextMaterial = materialQuery
    }

    const brandQuery = searchParams.get('marca')
    const nextBrand =
      brandQuery === 'MASTERPRINT' ||
      brandQuery === 'FUSIONX' ||
      brandQuery === 'ELEGOO' ||
      brandQuery === 'FULLJOY' ||
      brandQuery === 'TINMORY'
        ? brandQuery
        : 'Todos'

    const typeQuery = searchParams.get('tipo')
    const matchingType = productTypeOptions.find(
      (option) => option.value === typeQuery,
    )
    const nextType: ProductFilterValue = matchingType
      ? matchingType.value
      : 'Todos'

    setProductGroup(nextGroup)
    setMaterial(nextMaterial)
    setBrand(nextBrand)
    setType(nextType)
    setPreSaleOnly(searchParams.get('prevenda') === '1')
    setShowUnavailable(searchParams.get('esgotados') === '1')
    const requestedSort = searchParams.get('ordenar')
    setSortBy(
      requestedSort === 'price-asc' ||
        requestedSort === 'price-desc' ||
        requestedSort === 'name'
        ? requestedSort
        : 'featured',
    )
  }, [searchParams])

  const contextualProducts = useMemo(() => {
    const grouped = filterProductsByGroup(products, productGroup)
    const materialFiltered = filterProductsByDetails(
      grouped,
      material,
      'Todos',
      'Todos',
    )

    return preSaleOnly
      ? materialFiltered.filter((product) => product.status === 'PRE_VENDA')
      : materialFiltered
  }, [material, preSaleOnly, productGroup, products])

  const materialFacets = useMemo(() => {
    const groupedProducts = filterProductsByGroup(products, productGroup)
    const availableProducts = preSaleOnly
      ? groupedProducts.filter((product) => product.status === 'PRE_VENDA')
      : groupedProducts

    return productMaterialOptions
      .map((option) => ({
        ...option,
        count: filterProductsByDetails(
          availableProducts,
          option.value,
          'Todos',
          'Todos',
        ).length,
      }))
      .filter((option) => option.count > 0)
  }, [preSaleOnly, productGroup, products])

  const typeFacets = useMemo(
    () =>
      productTypeOptions
        .map((option) => ({
          ...option,
          count: filterProductsByDetails(
            contextualProducts,
            'Todos',
            'Todos',
            option.value,
          ).length,
        }))
        .filter((option) => option.count > 0),
    [contextualProducts],
  )

  const brandFacets = useMemo(
    () =>
      productBrandOptions
        .map((option) => ({
          ...option,
          count: contextualProducts.filter(
            (product) =>
              getProductBrand(product)?.toUpperCase() === option.value,
          ).length,
        }))
        .filter((option) => option.count > 0),
    [contextualProducts],
  )

  const catalogTitle = preSaleOnly
    ? 'Pré-venda'
    : material !== 'Todos'
      ? material
      : productGroup === 'FILAMENTOS'
        ? 'Filamentos'
        : productGroup === 'IMPRESSORAS'
          ? 'Impressoras 3D'
          : productGroup === 'ACESSORIOS'
            ? 'Peças e acessórios'
            : search
              ? `Resultados para “${search}”`
              : 'Todos os produtos'
  const showContextualFilters =
    materialFacets.length > 0 ||
    typeFacets.length > 0 ||
    brandFacets.length > 0
  const visibleTypeFacets = showAllFacetTypes
    ? typeFacets
    : typeFacets.slice(0, 7)

  const filteredBeforeStock = useMemo(() => {
    const byDetails = filterProductsByDetails(
      filterProductsByGroup(products, productGroup),
      material,
      brand,
      type,
    )
    return preSaleOnly
      ? byDetails.filter((product) => product.status === 'PRE_VENDA')
      : byDetails
  }, [brand, material, preSaleOnly, productGroup, products, type])

  const unavailableCount = useMemo(
    () =>
      filteredBeforeStock.filter(
        (product) => getProductAvailability(product).tone === 'neutral',
      ).length,
    [filteredBeforeStock],
  )

  const visibleProducts = useMemo(() => {
    const filtered = filteredBeforeStock.filter(
      (product) =>
        showUnavailable || getProductAvailability(product).tone !== 'neutral',
    )

    return filtered.sort((left, right) => {
      if (sortBy === 'price-asc') return left.price - right.price
      if (sortBy === 'price-desc') return right.price - left.price
      if (sortBy === 'name') {
        return getProductPublicName(left).localeCompare(
          getProductPublicName(right),
          'pt-BR',
          {
            sensitivity: 'base',
            numeric: true,
          },
        )
      }

      const featuredRank =
        Number(Boolean(right.featured)) - Number(Boolean(left.featured))

      return featuredRank || stockRank(left) - stockRank(right)
    })
  }, [filteredBeforeStock, showUnavailable, sortBy])

  const preSaleCount = useMemo(
    () => products.filter((product) => product.status === 'PRE_VENDA').length,
    [products],
  )
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize))
  const paginatedProducts = visibleProducts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  )
  useEffect(() => {
    setPage(1)
  }, [
    brand,
    material,
    preSaleOnly,
    productGroup,
    search,
    showUnavailable,
    sortBy,
    type,
  ])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const updateCatalogParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value) nextParams.set(key, value)
    else nextParams.delete(key)

    setSearchParams(nextParams, { replace: true })
  }

  const changePage = (nextPage: number) => {
    setPage(nextPage)
    window.requestAnimationFrame(() => {
      productsStartRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <DashboardLayout>
      <main className="container-store py-6 sm:py-10">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <nav
              aria-label="Navegação estrutural"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"
            >
              <Link to="/" className="transition hover:text-brand-orange">
                Início
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="text-slate-700">{catalogTitle}</span>
            </nav>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-navy sm:text-4xl">
              {catalogTitle}
            </h1>
            <p className="hidden">
              Explore as opções disponíveis e refine por acabamento ou marca.
              Produtos esgotados permanecem ocultos inicialmente.
            </p>
          </div>
        </section>

        {preSaleCount > 0 && (
          <button
            type="button"
            aria-pressed={preSaleOnly}
            onClick={() =>
              updateCatalogParam('prevenda', preSaleOnly ? undefined : '1')
            }
            className={`relative mt-6 flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition sm:p-5 ${
              preSaleOnly
                ? 'border-brand-orange bg-brand-orange text-white shadow-lg shadow-orange-200'
                : 'border-brand-orange/30 bg-gradient-to-r from-brand-orange/12 via-white to-white text-brand-navy hover:border-brand-orange'
            }`}
          >
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-xl ${
                preSaleOnly
                  ? 'bg-white/20 text-white'
                  : 'bg-brand-orange text-white'
              }`}
            >
              <Flame className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-black sm:text-base">
                Pré-venda em destaque
              </strong>
              <small
                className={`mt-0.5 block ${
                  preSaleOnly ? 'text-white/75' : 'text-slate-500'
                }`}
              >
                {preSaleCount} produto(s) para reservar antes da chegada
              </small>
            </span>
            <span
              className={`hidden rounded-full px-3 py-1.5 text-[10px] font-black tracking-wide uppercase sm:block ${
                preSaleOnly
                  ? 'bg-white text-brand-orange'
                  : 'bg-brand-orange text-white'
              }`}
            >
              {preSaleOnly ? 'Filtro ativo' : 'Ver pré-venda'}
            </span>
          </button>
        )}

        <div
          ref={productsStartRef}
          className="scroll-mt-48 pt-6"
        >
          <div className="sticky top-[128px] z-30 mb-4 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden">
            <label className="relative border-r border-slate-200">
              <span className="sr-only">Ordenar produtos</span>
              <select
                value={sortBy}
                onChange={(event) =>
                  updateCatalogParam(
                    'ordenar',
                    event.target.value === 'featured'
                      ? undefined
                      : event.target.value,
                  )
                }
                className="h-12 w-full appearance-none bg-white px-4 text-center text-xs font-extrabold text-slate-700 outline-none"
              >
                <option value="featured">Ordenar</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name">Nome: A–Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-slate-400" />
            </label>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 text-xs font-extrabold text-slate-700"
            >
              <SlidersHorizontal className="size-4" />
              Filtrar
            </button>
          </div>

          <div
            className={
              showContextualFilters
                ? 'grid items-start gap-5 lg:grid-cols-[210px_minmax(0,1fr)]'
                : ''
            }
          >
            {showContextualFilters && (
              <>
              {mobileFiltersOpen && (
                <button
                  type="button"
                  aria-label="Fechar filtros"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm lg:hidden"
                />
              )}
              <aside
                className={`fixed inset-y-0 left-0 z-[60] w-[88vw] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-300 lg:sticky lg:top-48 lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:rounded-xl lg:p-4 lg:shadow-sm ${
                  mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 lg:hidden">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.15em] text-brand-orange uppercase">
                      Refinar catálogo
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      Filtros
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600"
                    aria-label="Fechar filtros"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                {materialFacets.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black text-slate-950">
                      Tipo de filamento
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Escolha o material que deseja comprar
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
                      {materialFacets.map((option) => {
                        const selected = material === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateCatalogParam(
                                'material',
                                selected ? undefined : option.value,
                              )
                            }
                            className={cn(
                              'flex min-h-11 items-center justify-between rounded-xl border px-3 text-left transition',
                              selected
                                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-orange/50 hover:bg-slate-50',
                            )}
                          >
                            <span className="text-xs font-black">
                              {option.label}
                            </span>
                            <span
                              className={cn(
                                'rounded-full px-2 py-1 text-[9px] font-black',
                                selected
                                  ? 'bg-brand-orange text-white'
                                  : 'bg-slate-100 text-slate-500',
                              )}
                            >
                              {option.count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}
                {typeFacets.length > 0 && (
                  <section
                    className={
                      materialFacets.length > 0
                        ? 'mt-5 border-t border-slate-100 pt-5'
                        : ''
                    }
                  >
                    <h2 className="text-sm font-black text-slate-950">
                      Acabamento
                    </h2>
                    <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                      {visibleTypeFacets.map((option) => {
                        const selected = type === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateCatalogParam(
                                'tipo',
                                selected ? undefined : option.value,
                              )
                            }
                            className={`flex min-w-0 items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold transition ${
                              selected
                                ? 'bg-orange-50 text-brand-orange'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                            }`}
                          >
                            <span className="min-w-0 truncate">
                              {option.label}
                            </span>
                            <span className="shrink-0 text-[9px] text-slate-400">
                              {option.count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {typeFacets.length > 7 && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAllFacetTypes((current) => !current)
                        }
                        className="mt-2 px-2.5 text-[10px] font-black text-brand-orange hover:underline"
                      >
                        {showAllFacetTypes ? 'Ver menos' : 'Ver mais'}
                      </button>
                    )}
                  </section>
                )}

                {brandFacets.length > 0 && (
                  <section
                    className={
                      typeFacets.length > 0
                        || materialFacets.length > 0
                        ? 'mt-5 border-t border-slate-100 pt-5'
                        : ''
                    }
                  >
                    <h2 className="text-sm font-black text-slate-950">Marca</h2>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                      {brandFacets.map((option) => {
                        const selected = brand === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateCatalogParam(
                                'marca',
                                selected ? undefined : option.value,
                              )
                            }
                            className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-left"
                          >
                            <span
                              className={`grid size-5 shrink-0 place-items-center rounded border transition ${
                                selected
                                  ? 'border-brand-orange bg-brand-orange text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}
                            >
                              <Check className="size-3" />
                            </span>
                            <span
                              className={`min-w-0 flex-1 truncate text-xs font-bold ${
                                selected
                                  ? 'text-brand-orange'
                                  : 'text-slate-600'
                              }`}
                            >
                              {option.label}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              ({option.count})
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-black text-sm font-extrabold text-white lg:hidden"
                >
                  Ver {visibleProducts.length} produto(s)
                </button>
              </aside>
              </>
            )}

            <section className="min-w-0">
              <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-brand-navy">
                    {preSaleOnly ? 'Produtos em pré-venda' : 'Todos os produtos'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {visibleProducts.length} resultado(s)
                    {!showUnavailable && unavailableCount > 0
                      ? ` · ${unavailableCount} esgotado(s) oculto(s)`
                      : ''}
                  </p>
                </div>
                <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-end">
                  <label className="relative block min-w-44">
                    <span className="mb-1 block text-[9px] font-black tracking-[0.12em] text-slate-400 uppercase">
                      Ordenar por
                    </span>
                    <select
                      value={sortBy}
                      onChange={(event) =>
                        updateCatalogParam(
                          'ordenar',
                          event.target.value === 'featured'
                            ? undefined
                            : event.target.value,
                        )
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pr-9 pl-3 text-xs font-extrabold text-slate-800 outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10"
                    >
                      <option value="featured">Destaques</option>
                      <option value="price-asc">Menor preço</option>
                      <option value="price-desc">Maior preço</option>
                      <option value="name">Nome: A–Z</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 bottom-3 size-3.5 text-slate-400" />
                  </label>
                  <ProductPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={visibleProducts.length}
                    pageSize={pageSize}
                    onPageChange={changePage}
                  />
                </div>
              </div>

              {loading || error ? (
                <CatalogState
                  loading={loading}
                  error={error}
                  onRetry={() => void reload()}
                />
              ) : visibleProducts.length ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="mt-6 sm:hidden">
                    <ProductPagination
                      page={page}
                      totalPages={totalPages}
                      totalItems={visibleProducts.length}
                      pageSize={pageSize}
                      onPageChange={changePage}
                    />
                  </div>
                </div>
              ) : (
                <div className="surface-card rounded-2xl border-dashed p-10 text-center">
                  <Layers3 className="mx-auto size-8 text-slate-300" />
                  <p className="mt-3 font-extrabold text-brand-navy">
                    Nenhum produto disponível com esses filtros
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-xs font-extrabold text-brand-orange"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
