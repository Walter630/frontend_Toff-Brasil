import {
  ArrowRight,
  Boxes,
  Flame,
  Layers3,
  PackageCheck,
  Printer,
  ScanLine,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { BarcodeScannerModal } from '../components/barcode/BarcodeScannerModal'
import { CatalogState } from '../components/catalog/CatalogState'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useProducts } from '../hooks/useProducts'
import { getProductPublicName } from '../lib/product-display'
import {
  filterProductsByDetails,
  productMaterialOptions,
} from '../lib/product-filters'
import { authService } from '../services/auth-service'
import type { Product } from '../types/product'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const fallbackFilamentImage =
  '/products/toffco-stock/fusionx-pla-high-speed-marble-white.jpeg'

const filamentTypeDetails: Record<string, { description: string; image: string; color: string }> = {
  PLA: {
    description: 'Fácil de imprimir, ótimo para peças visuais e uso geral.',
    image: '/products/toffco-stock/elegoo-pla-silk-red.jpeg',
    color: 'from-blue-500 to-indigo-600',
  },
  PETG: {
    description: 'Mais resistente para peças que precisam durar.',
    image: fallbackFilamentImage,
    color: 'from-emerald-500 to-teal-600',
  },
  ABS: {
    description: 'Para projetos técnicos e alta resistência.',
    image: '/products/toffco-stock/fulljoy-pla-metal-titanium.jpeg',
    color: 'from-amber-500 to-orange-600',
  },
  TPU: {
    description: 'Flexível para peças maleáveis e encaixes.',
    image: '/products/toffco-stock/fulljoy-pla-metal-iron-green.jpeg',
    color: 'from-purple-500 to-violet-600',
  },
}

function isFilamentProduct(product: Product) {
  const text = `${product.categoria} ${product.name} ${product.description}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  return (
    text.includes('FILAMENTO') ||
    text.includes('FILAMENTOS') ||
    text.includes('PLA') ||
    text.includes('PETG') ||
    text.includes('TPU') ||
    text.includes('ABS')
  )
}

function ProductCarouselCard({ product, index }: { product: Product; index: number }) {
  const name = getProductPublicName(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/produtos/${product.id}`}
        className="group relative flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-orange/10 sm:w-[260px]"
      >
        {/* Image area with gradient overlay on hover */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <img
            src={product.image}
            alt={name}
            className="size-full object-contain transition duration-700 ease-out group-hover:scale-110"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = fallbackFilamentImage
            }}
          />
          {/* Floating price tag */}
          <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm transition duration-300 group-hover:bg-brand-orange group-hover:text-white">
            <span className="text-sm font-extrabold text-brand-navy group-hover:text-white">
              {currency.format(product.price)}
            </span>
          </div>
          {/* Action button on hover */}
          <div className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/80 text-brand-navy opacity-0 shadow-lg backdrop-blur-sm transition duration-300 group-hover:opacity-100">
            <ShoppingCart className="size-4" />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-orange">
            {product.categoria === 'FILAMENTOS' ? 'Filamento' : product.categoria}
          </span>
          <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-brand-navy">
            {name}
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}

export function DashboardPage() {
  const [search, setSearch] = useState('')
  const [barcodeSearch, setBarcodeSearch] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const canScanProducts = authService.canScanProducts()
  const carouselRef = useRef<HTMLDivElement>(null)

  const filters = useMemo(
    () => ({
      name: search.trim() || undefined,
      codigoBarras: barcodeSearch || undefined,
    }),
    [barcodeSearch, search],
  )
  const { products, loading, error, reload } = useProducts(filters)
  const filamentProducts = useMemo(
    () => products.filter(isFilamentProduct),
    [products],
  )
  const allProducts = useMemo(
    () => filterProductsByDetails(products, 'Todos', 'Todos', 'Todos'),
    [products],
  )
  const availableCount = useMemo(
    () => products.filter((p) => p.estoque > 0 && p.status !== 'SEM_ESTOQUE').length,
    [products],
  )
  const railProducts = allProducts.slice(0, 10)

  const handleBarcodeScan = (code: string) => {
    setBarcodeSearch(code)
    setSearch(code)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const amount = direction === 'left' ? -300 : 300
    carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <DashboardLayout>
      <main className="overflow-x-hidden px-4 py-5 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px] space-y-7 sm:space-y-10">

          {/* === HERO SECTION === */}
          <section className="relative overflow-hidden rounded-[2rem] bg-brand-navy p-5 text-white sm:p-8 lg:p-12">
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-brand-orange/15 blur-[100px]" />
            <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-blue-500/10 blur-[80px]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
                >
                  <Zap className="size-3.5 text-brand-orange" />
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-200">
                    Filamentos · Impressoras · Peças
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="mt-4 max-w-lg text-2xl font-extrabold leading-[1.15] tracking-tight sm:text-3xl lg:text-[2.75rem]"
                >
                  Sua loja de{' '}
                  <span className="bg-gradient-to-r from-brand-orange to-amber-400 bg-clip-text text-transparent">
                    impressão 3D
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mt-2 max-w-md text-sm leading-relaxed text-blue-100/60"
                >
                  Explore filamentos, impressoras e acessórios. Tudo num só lugar, com entrega para todo Brasil.
                </motion.p>

                {/* Search */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-5 flex max-w-md items-center gap-2"
                >
                  <label className="relative block min-w-0 flex-1">
                    <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setBarcodeSearch('')
                      }}
                      placeholder="Buscar produtos..."
                      className="h-13 w-full rounded-2xl border-0 bg-white pl-12 pr-4 text-sm font-semibold text-brand-navy shadow-xl outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-brand-orange/30"
                    />
                  </label>
                  {canScanProducts && (
                    <button
                      type="button"
                      onClick={() => setScannerOpen(true)}
                      className="inline-flex h-13 shrink-0 items-center gap-2 rounded-2xl bg-white/10 px-5 text-sm font-bold backdrop-blur-sm transition hover:bg-white/20"
                    >
                      <ScanLine className="size-5" />
                    </button>
                  )}
                </motion.div>

                {barcodeSearch && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-orange-200">
                    <span>Código: {barcodeSearch}</span>
                    <button
                      type="button"
                      onClick={() => { setBarcodeSearch(''); setSearch('') }}
                      className="grid size-5 place-items-center rounded-full hover:bg-white/10"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}

                {/* Quick actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-5 flex flex-wrap gap-2 sm:gap-3"
                >
                  <Link
                    to="/catalogo"
                    className="group inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-bold shadow-lg shadow-brand-orange/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-orange/30 sm:rounded-2xl sm:px-6 sm:py-3"
                  >
                    Ver catálogo
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/carrinho"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/5 sm:rounded-2xl sm:px-6 sm:py-3"
                  >
                    <ShoppingCart className="size-4" />
                    Meu carrinho
                  </Link>
                </motion.div>
              </div>

              {/* Right side - Stats cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="hidden flex-col gap-3 lg:flex"
              >
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-orange/20">
                    <PackageCheck className="size-5 text-brand-orange" />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold">{availableCount || '—'}</p>
                    <p className="text-xs text-blue-100/60">Produtos disponíveis</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <span className="grid size-12 place-items-center rounded-xl bg-emerald-500/20">
                    <TrendingUp className="size-5 text-emerald-400" />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold">{products.length || '—'}</p>
                    <p className="text-xs text-blue-100/60">No catálogo</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <span className="grid size-12 place-items-center rounded-xl bg-amber-500/20">
                    <Star className="size-5 text-amber-400" />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold">4.9</p>
                    <p className="text-xs text-blue-100/60">Avaliação média</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* === CATEGORIES GRID === */}
          <section>
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-orange/10 text-brand-orange">
                <Boxes className="size-4" />
              </span>
              <h2 className="text-xl font-extrabold text-brand-navy">Navegue por categoria</h2>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Filamentos', icon: Layers3, count: filamentProducts.length, gradient: 'from-orange-500 to-amber-500' },
                { label: 'Impressoras', icon: Printer, count: products.filter(p => p.categoria === 'IMPRESSORAS').length, gradient: 'from-blue-500 to-indigo-500' },
                { label: 'Acessórios', icon: Wrench, count: products.filter(p => p.categoria === 'ACESSORIOS' || p.categoria === 'PECAS').length, gradient: 'from-emerald-500 to-teal-500' },
                { label: 'Ver tudo', icon: Sparkles, count: products.length, gradient: 'from-purple-500 to-violet-500' },
              ].map(({ label, icon: Icon, count, gradient }) => (
                <Link
                  key={label}
                  to="/catalogo"
                  className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-0 transition duration-300 group-hover:opacity-100`} />
                  <div className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-200/50 transition duration-300 group-hover:scale-110`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-brand-navy">{label}</h3>
                  <p className="mt-1 text-xs text-slate-400">{count} produto(s)</p>
                </Link>
              ))}
            </div>
          </section>

          {/* === FILAMENT TYPES === */}
          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-brand-orange/10 text-brand-orange">
                  <Flame className="size-4" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-brand-navy">Tipos de filamento</h2>
                  <p className="text-xs text-slate-500">Escolha pelo tipo de uso do seu projeto</p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {productMaterialOptions.map((item, i) => {
                const detail = filamentTypeDetails[item.value]
                return (
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <Link
                      to="/catalogo"
                      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    >
                      {/* Color accent */}
                      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${detail.color} transition-all duration-300 group-hover:h-2`} />

                      <div className="relative grid h-44 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/80 p-6">
                        <img
                          src={detail.image}
                          alt={`Filamento ${item.label}`}
                          className="max-h-full max-w-full object-contain transition duration-700 ease-out group-hover:scale-115"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src = fallbackFilamentImage
                          }}
                        />
                        {/* Floating badge */}
                        <div className={`absolute right-3 top-4 rounded-full bg-gradient-to-r ${detail.color} px-3 py-1 text-[10px] font-bold text-white shadow-md`}>
                          {item.label}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-lg font-extrabold text-brand-navy">{item.label}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                          {detail.description}
                        </p>
                        <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-brand-orange transition group-hover:gap-3">
                          Explorar
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* === PRODUCT CAROUSEL === */}
          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-brand-orange/10 text-brand-orange">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-brand-navy">Em destaque</h2>
                  <p className="text-xs text-slate-500">Os mais procurados da loja</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-brand-navy shadow-sm transition hover:border-brand-orange/30 hover:text-brand-orange"
                  aria-label="Anterior"
                >
                  <ArrowRight className="size-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-brand-navy shadow-sm transition hover:border-brand-orange/30 hover:text-brand-orange"
                  aria-label="Próximo"
                >
                  <ArrowRight className="size-4" />
                </button>
                <Link
                  to="/catalogo"
                  className="ml-2 hidden items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-navy-light sm:inline-flex"
                >
                  Ver todos
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {loading || error ? (
              <div className="mt-5">
                <CatalogState loading={loading} error={error} onRetry={() => void reload()} />
              </div>
            ) : (
              <div
                ref={carouselRef}
                className="mt-5 -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 no-scrollbar"
              >
                {railProducts.length > 0
                  ? railProducts.map((product, i) => (
                      <ProductCarouselCard key={product.id} product={product} index={i} />
                    ))
                  : Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-[260px] shrink-0 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-900/5">
                        <div className="aspect-square animate-pulse bg-slate-100" />
                        <div className="p-4">
                          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                {/* CTA card at end */}
                <Link
                  to="/catalogo"
                  className="grid w-[240px] shrink-0 snap-start place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-orange-50 to-white p-8 text-center transition hover:border-brand-orange/40 sm:w-[260px]"
                >
                  <div>
                    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                      <ArrowRight className="size-6" />
                    </span>
                    <h3 className="mt-4 font-bold text-brand-navy">Ver catálogo</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Todos os produtos e filtros
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </section>

        </div>

        {canScanProducts && (
          <BarcodeScannerModal
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onScan={handleBarcodeScan}
          />
        )}
      </main>
    </DashboardLayout>
  )
}
