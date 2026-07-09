import {
  ArrowRight,
  PackageCheck,
  ScanLine,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
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
const filamentTypeDetails: Record<string, { description: string; image: string }> = {
  PLA: {
    description: 'Facil de imprimir, otimo para pecas visuais e uso geral.',
    image: '/products/toffco-stock/elegoo-pla-silk-red.jpeg',
  },
  PETG: {
    description: 'Mais resistente para pecas que precisam durar mais.',
    image: fallbackFilamentImage,
  },
  ABS: {
    description: 'Boa opcao para projetos tecnicos e maior resistencia.',
    image: '/products/toffco-stock/fulljoy-pla-metal-titanium.jpeg',
  },
  TPU: {
    description: 'Flexivel para pecas maleaveis, protecoes e encaixes.',
    image: '/products/toffco-stock/fulljoy-pla-metal-iron-green.jpeg',
  },
}
const editorialHighlights = [
  {
    title: 'Cores silk e especiais',
    description: 'Modelos com acabamento visual para pecas decorativas.',
    image: '/products/toffco-stock/elegoo-pla-silk-blue-purple-black.jpeg',
  },
  {
    title: 'PLA de alta velocidade',
    description: 'Filamentos pensados para produtividade na impressao.',
    image: '/products/toffco-stock/fusionx-pla-high-speed-sky-blue.jpeg',
  },
  {
    title: 'Acabamento matte',
    description: 'Opcoes com visual fosco e aparencia mais premium.',
    image: '/products/toffco-stock/fusionx-pla-matte-light-gray.jpeg',
  },
]

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

function ProductRailCard({ product }: { product: Product }) {
  const name = getProductPublicName(product)

  return (
    <Link
      to={`/produtos/${product.id}`}
      className="group w-[78vw] max-w-[270px] shrink-0 snap-start overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[250px]"
    >
      <div className="grid aspect-[4/3] place-items-center bg-slate-50 p-5">
        <img
          src={product.image}
          alt={name}
          className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = fallbackFilamentImage
          }}
        />
      </div>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
          Filamento
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-11 font-bold leading-snug text-brand-navy">
          {name}
        </h3>
        <div className="mt-4 flex items-center justify-between gap-3">
          <strong className="text-lg text-brand-orange">
            {currency.format(product.price)}
          </strong>
          <span className="grid size-9 place-items-center rounded-full bg-brand-navy text-white transition group-hover:bg-brand-orange">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function MoreCatalogCard() {
  return (
    <Link
      to="/catalogo"
      className="grid w-[78vw] max-w-[270px] shrink-0 snap-start place-items-center rounded-3xl border border-dashed bg-white p-6 text-center shadow-sm transition hover:border-orange-200 hover:bg-orange-50 sm:w-[250px]"
    >
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-navy text-white">
          <ArrowRight className="size-5" />
        </span>
        <h3 className="mt-4 font-bold text-brand-navy">Ver mais filamentos</h3>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          Abra o catalogo completo para filtros avancados.
        </p>
      </div>
    </Link>
  )
}

function EditorialRailCard({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image: string
}) {
  return (
    <Link
      to="/catalogo"
      className="group w-[78vw] max-w-[270px] shrink-0 snap-start overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[250px]"
    >
      <div className="grid aspect-[4/3] place-items-center bg-slate-50 p-5">
        <img
          src={image}
          alt={title}
          className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = fallbackFilamentImage
          }}
        />
      </div>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
          Colecao
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-11 font-bold leading-snug text-brand-navy">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  )
}

export function DashboardPage() {
  const [search, setSearch] = useState('')
  const [barcodeSearch, setBarcodeSearch] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const canScanProducts = authService.canScanProducts()

  const filters = useMemo(
    () => ({
      name: search.trim() || undefined,
      codigoBarras: barcodeSearch || undefined,
      categoria: 'FILAMENTOS',
    }),
    [barcodeSearch, search],
  )
  const { products, loading, error, reload } = useProducts(filters)
  const filamentProducts = useMemo(
    () => products.filter(isFilamentProduct),
    [products],
  )
  const visibleProducts = useMemo(
    () => filterProductsByDetails(filamentProducts, 'Todos', 'Todos', 'Todos'),
    [filamentProducts],
  )
  const availableProducts = useMemo(
    () =>
      filamentProducts.filter(
        (product) => product.estoque > 0 && product.status !== 'SEM_ESTOQUE',
      ).length,
    [filamentProducts],
  )
  const featuredProduct = visibleProducts[0] ?? filamentProducts[0]
  const railProducts = visibleProducts.slice(0, 5)
  const featuredImage = featuredProduct?.image || fallbackFilamentImage
  const featuredName = featuredProduct
    ? getProductPublicName(featuredProduct)
    : 'Filamentos para impressao 3D'

  const handleBarcodeScan = (code: string) => {
    setBarcodeSearch(code)
    setSearch(code)
  }

  return (
    <DashboardLayout>
      <main className="overflow-x-hidden px-4 py-5 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_390px]">
              <div className="min-w-0 p-5 sm:p-8 lg:p-10">
                <p className="text-sm font-bold text-brand-orange">
                  Loja de filamentos
                </p>
                <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-brand-navy sm:text-4xl lg:text-5xl">
                  Filamentos para impressao 3D, prontos para comprar.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Encontre PLA, PETG, TPU e marcas como Masterprint sem
                  complicacao. Para filtros completos, use o Catalogo no menu.
                </p>

                <div className="mt-7 rounded-2xl border bg-slate-50 p-2">
                  <div className="flex items-center gap-2">
                    <label className="relative block min-w-0 flex-1">
                      <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value)
                          setBarcodeSearch('')
                        }}
                        placeholder="Buscar filamentos"
                        className="h-14 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm font-semibold text-brand-navy shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </label>
                    {canScanProducts && (
                      <button
                        type="button"
                        onClick={() => setScannerOpen(true)}
                        className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-bold text-white transition hover:bg-brand-navy-light"
                      >
                        <ScanLine className="size-5" />
                        <span className="hidden sm:inline">Escanear</span>
                      </button>
                    )}
                  </div>
                  {barcodeSearch && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-brand-orange">
                      <span className="truncate">Codigo: {barcodeSearch}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBarcodeSearch('')
                          setSearch('')
                        }}
                        className="grid size-7 place-items-center rounded-lg hover:bg-orange-100"
                        aria-label="Limpar codigo escaneado"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to="/catalogo"
                    className="rounded-full bg-brand-navy px-4 py-2 text-sm font-bold text-white"
                  >
                    Ver todos
                  </Link>
                  {productMaterialOptions.map((item) => (
                    <Link
                      key={item.value}
                      to="/catalogo"
                      className="rounded-full border bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-orange-200 hover:text-brand-orange"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <aside className="border-t bg-brand-navy p-5 text-white sm:p-8 lg:border-l lg:border-t-0">
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center lg:items-stretch lg:justify-between lg:text-left">
                  <div className="max-w-sm lg:max-w-none">
                    <p className="text-xs font-bold uppercase tracking-wide text-orange-200">
                      Destaque
                    </p>
                    {featuredProduct ? (
                      <>
                        <h2 className="mt-2 line-clamp-2 text-2xl font-bold">
                          {featuredName}
                        </h2>
                        <p className="mt-2 text-xl font-bold text-orange-200">
                          {currency.format(featuredProduct.price)}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="mt-2 text-2xl font-bold">
                          Escolha seu filamento ideal
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-blue-100/75">
                          Veja PLA, PETG, ABS e TPU no catalogo completo.
                        </p>
                      </>
                    )}
                  </div>
                  <Link
                    to={featuredProduct ? `/produtos/${featuredProduct.id}` : '/catalogo'}
                    className="mx-auto grid aspect-[4/3] w-full max-w-sm place-items-center rounded-3xl bg-white p-5 transition hover:scale-[1.01] lg:max-w-none"
                  >
                    <img
                      src={featuredImage}
                      alt={featuredName}
                      className="max-h-full max-w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.src = fallbackFilamentImage
                      }}
                    />
                  </Link>
                  <div className="flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 lg:max-w-none lg:justify-start">
                    <PackageCheck className="size-5 shrink-0 text-orange-200" />
                    <span className="text-sm text-blue-100/80 lg:text-left">
                      {availableProducts > 0
                        ? `${availableProducts} filamento(s) disponiveis agora`
                        : 'Consulte os modelos disponiveis no catalogo'}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-sm font-semibold text-brand-orange">
                Tipos de filamento
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-navy">
                Escolha pelo tipo de uso
              </h2>
            </div>
            <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {productMaterialOptions.map((item) => {
                const detail = filamentTypeDetails[item.value]

                return (
                  <Link
                    key={item.value}
                    to="/catalogo"
                    className="flex h-full flex-col overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                  >
                    <div className="grid h-36 shrink-0 overflow-hidden bg-slate-50 p-4">
                      <img
                        src={detail.image}
                        alt={`Filamento ${item.label}`}
                        className="m-auto max-h-full max-w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.src = fallbackFilamentImage
                        }}
                      />
                    </div>
                    <div className="relative z-10 flex flex-1 flex-col border-t bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-bold text-brand-navy">
                          {item.label}
                        </h3>
                        <span className="grid size-8 place-items-center rounded-full bg-orange-50 text-brand-orange">
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-5 text-slate-500">
                        {detail.description}
                      </p>
                      <span className="mt-auto pt-4 text-sm font-bold text-brand-orange">
                        Ver no catalogo
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand-orange">
                  Continue olhando
                </p>
                <h2 className="mt-1 text-2xl font-bold text-brand-navy">
                  Filamentos em destaque
                </h2>
              </div>
              <Link
                to="/catalogo"
                className="hidden text-sm font-bold text-brand-orange sm:inline-flex"
              >
                Ver catalogo
              </Link>
            </div>

            {loading || error ? (
              <CatalogState
                loading={loading}
                error={error}
                onRetry={() => void reload()}
              />
            ) : (
              <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex snap-x gap-4">
                  {railProducts.length
                    ? railProducts.map((product) => (
                        <ProductRailCard key={product.id} product={product} />
                      ))
                    : editorialHighlights.map((item) => (
                        <EditorialRailCard
                          key={item.title}
                          title={item.title}
                          description={item.description}
                          image={item.image}
                        />
                      ))}
                  <MoreCatalogCard />
                </div>
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
