import {
  ArrowLeft,
  BadgeCheck,
  Layers3,
  LoaderCircle,
  MessageCircle,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { ProductCard } from '../components/catalog/ProductCard'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { getApiErrorMessage } from '../lib/api-error'
import { savePendingCartProduct } from '../lib/cart-auth'
import { notifyCartUpdated } from '../lib/cart-events'
import {
  getAvailabilityClasses,
  getProductAvailability,
} from '../lib/product-status'
import {
  getProductBrand,
  getProductColorName,
  getProductLineName,
  getProductMaterial,
  getProductPublicName,
} from '../lib/product-display'
import { localProductsEvent } from '../lib/local-product-db'
import {
  getProductRestockWhatsappUrl,
  getProductWhatsappUrl,
} from '../lib/whatsapp'
import { authService } from '../services/auth-service'
import { cartService } from '../services/cart-service'
import { productService } from '../services/product-service'
import type { Product } from '../types/product'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ProductDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [message, setMessage] = useState('')
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([])
  const [userRating, setUserRating] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState('')
  const [showStickyPurchase, setShowStickyPurchase] = useState(false)
  const [slideDirection, setSlideDirection] = useState(1)
  const variantSelectionRef = useRef(0)

  useLayoutEffect(() => {
    setShowStickyPurchase(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [id])

  const availability = product ? getProductAvailability(product) : null
  const publicName = product ? getProductPublicName(product) : ''
  const detailTitle = product ? getProductLineName(product) : ''
  const productBrand = product ? getProductBrand(product) : undefined
  const productTitle = [productBrand, detailTitle]
    .filter(
      (value, index, values): value is string =>
        Boolean(value) &&
        values.findIndex(
          (candidate) =>
            candidate?.trim().toLowerCase() === value?.trim().toLowerCase(),
        ) === index,
    )
    .join(' ')
  const productMaterial = product ? getProductMaterial(product) : undefined
  const selectedOptionName = product ? getProductColorName(product) : ''
  const maximumQuantity =
    product && product.estoque > 0 ? product.estoque : 1
  const isPreSale = product?.status === 'PRE_VENDA'
  const availabilitySummary =
    product && availability
      ? isPreSale
        ? `${product.estoque} unidade${product.estoque === 1 ? '' : 's'} prevista${product.estoque === 1 ? '' : 's'} para esta opção`
        : availability.description
      : ''
  const productVariants = useMemo(() => {
    if (!product) return []

    // Variantes por variantGroup (peças/placas com variantes explícitas)
    if (product.variantGroup) {
      return catalogProducts
        .filter(
          (item) =>
            item.ativo && item.variantGroup === product.variantGroup,
        )
        .sort((left, right) =>
          (left.variantLabel ?? left.name).localeCompare(
            right.variantLabel ?? right.name,
            'pt-BR',
            { sensitivity: 'base', numeric: true },
          ),
        )
    }

    // Variantes por agrupamento automático (filamentos)
    if (!productBrand) return []

    return catalogProducts
      .filter(
        (item) =>
          item.ativo &&
          item.categoria === product.categoria &&
          getProductBrand(item)?.toUpperCase() ===
            productBrand.toUpperCase() &&
          getProductMaterial(item) === productMaterial &&
          getProductLineName(item) === detailTitle &&
          Math.abs(item.price - product.price) < 0.01,
      )
      .sort((left, right) => {
        const leftUnavailable =
          getProductAvailability(left).tone === 'neutral'
        const rightUnavailable =
          getProductAvailability(right).tone === 'neutral'

        if (leftUnavailable !== rightUnavailable) {
          return leftUnavailable ? 1 : -1
        }

        return getProductPublicName(left).localeCompare(
          getProductPublicName(right),
          'pt-BR',
          { sensitivity: 'base', numeric: true },
        )
      })
  }, [
    catalogProducts,
    detailTitle,
    product,
    productBrand,
    productMaterial,
  ])
  const productImages = useMemo(() => {
    if (!product) return []

    return Array.from(
      new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
    )
  }, [product])
  const galleryItems = useMemo(() => {
    if (!product) return []

    if (productImages.length > 1) {
      return productImages.map((image) => ({
        key: `${product.id}:${image}`,
        image,
        product,
        label: `${detailTitle} — foto do produto`,
      }))
    }

    if (productVariants.length > 1) {
      return productVariants.map((variant) => ({
        key: variant.id,
        image: variant.image,
        product: variant,
        label: `${getProductLineName(variant)} — ${getProductColorName(variant)}`,
      }))
    }

    return productImages.map((image) => ({
      key: `${product.id}:${image}`,
      image,
      product,
      label: `${detailTitle} — foto do produto`,
    }))
  }, [detailTitle, product, productImages, productVariants])
  const similarProducts = useMemo(() => {
    if (!product) return []

    const availableProducts = catalogProducts.filter(
      (item) =>
        item.id !== product.id &&
        item.ativo &&
        getProductAvailability(item).tone !== 'neutral',
    )
    const sameCategory = availableProducts.filter(
      (item) => item.categoria === product.categoria,
    )
    const otherCategories = availableProducts.filter(
      (item) => item.categoria !== product.categoria,
    )

    return [...sameCategory, ...otherCategories].slice(0, 5)
  }, [catalogProducts, product])
  const catalogReturnPath =
    (location.state as { catalogPath?: string } | null)?.catalogPath ??
    '/catalogo'

  function handleRating(value: number) {
    setUserRating(value)
    if (product) {
      window.localStorage.setItem(`toffbr-rating-${product.id}`, String(value))
    }
  }

  async function handleSelectVariant(variant: Product) {
    if (variant.id === product?.id) return

    const selectionId = ++variantSelectionRef.current
    const image = new Image()
    image.src = variant.image

    try {
      await image.decode()
    } catch {
      // Se o navegador não conseguir decodificar antes, ainda troca a opção.
    }

    if (selectionId !== variantSelectionRef.current) return

    const currentIndex = productVariants.findIndex(
      (item) => item.id === product?.id,
    )
    const nextIndex = productVariants.findIndex(
      (item) => item.id === variant.id,
    )
    setSlideDirection(nextIndex >= currentIndex ? 1 : -1)
    setProduct(variant)
    setSelectedImage(variant.image)
    setQuantity(1)
    setMessage('')
  }

  async function handleSelectImage(nextImage: string) {
    if (nextImage === selectedImage) return

    const currentIndex = productImages.indexOf(selectedImage)
    const nextIndex = productImages.indexOf(nextImage)
    const image = new Image()
    image.src = nextImage

    try {
      await image.decode()
    } catch {
      // Mantém a troca disponível mesmo em navegadores sem decode antecipado.
    }

    setSlideDirection(nextIndex >= currentIndex ? 1 : -1)
    setSelectedImage(nextImage)
  }

  async function handleAddToCart() {
    if (!product) return
    setMessage('')

    if (!authService.isAuthenticated()) {
      savePendingCartProduct(product.id, quantity)
      navigate('/login', { state: { from: '/carrinho' } })
      return
    }

    setAddingToCart(true)
    try {
      const cart = await cartService.addItem(product.id, quantity)
      window.dispatchEvent(new Event(localProductsEvent))
      notifyCartUpdated({ cart, addedProductName: publicName })
      setMessage('Adicionado ao carrinho!')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Não foi possível adicionar ao carrinho.'))
    } finally {
      setAddingToCart(false)
    }
  }

  function handleShare() {
    if (navigator.share) {
      void navigator.share({ title: publicName, url: window.location.href })
    } else {
      void navigator.clipboard.writeText(window.location.href)
      setMessage('Link copiado!')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  useEffect(() => {
    if (!product) return

    const savedRating = Number(
      window.localStorage.getItem(`toffbr-rating-${product.id}`) ?? 0,
    )
    setUserRating(
      Number.isInteger(savedRating) && savedRating >= 1 && savedRating <= 5
        ? savedRating
        : 0,
    )
  }, [product])

  useEffect(() => {
    const loadProduct = (showLoading = true) => {
      if (showLoading) setLoading(true)
      productService
        .findById(id)
        .then((loadedProduct) => {
          setProduct(loadedProduct)
          setSelectedImage(loadedProduct.image)
        })
        .catch((error) => {
          if (showLoading) setMessage(getApiErrorMessage(error))
        })
        .finally(() => {
          if (showLoading) setLoading(false)
        })
    }
    loadProduct()
  }, [id])

  useEffect(() => {
    const handleScroll = () => setShowStickyPurchase(window.scrollY > 520)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let cancelled = false

    productService
      .list()
      .then((products) => {
        if (!cancelled) setCatalogProducts(products)
      })
      .catch(() => {
        if (!cancelled) setCatalogProducts([])
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <DashboardLayout>
      <main className="container-store py-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <Link
            to={catalogReturnPath}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-brand-orange hover:shadow-md"
          >
            <ArrowLeft className="size-4" />
            Voltar ao catálogo
          </Link>

          {loading ? (
            <div className="mt-20 grid min-h-80 place-items-center">
              <div className="text-center">
                <LoaderCircle className="mx-auto size-10 animate-spin text-brand-orange" />
                <p className="mt-3 text-sm text-slate-500">Carregando produto...</p>
              </div>
            </div>
          ) : product ? (
            <>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="surface-card mt-6 grid min-w-0 overflow-hidden rounded-[1.5rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.88fr)]"
            >
              {/* Image */}
              <div className="relative min-w-0 border-b bg-white lg:border-r lg:border-b-0">
                <div
                  className={
                    galleryItems.length > 1
                      ? 'grid min-w-0 lg:grid-cols-[72px_minmax(0,1fr)]'
                      : 'overflow-hidden'
                  }
                >
                  {galleryItems.length > 1 && (
                    <div className="no-scrollbar order-2 flex gap-2 overflow-x-auto border-t border-slate-100 bg-white p-3 lg:order-1 lg:grid lg:max-h-[520px] lg:auto-rows-max lg:content-start lg:overflow-y-auto lg:border-t-0 lg:border-r">
                      {galleryItems.map((item) => {
                        const selected =
                          item.product.id === product.id &&
                          item.image === (selectedImage || product.image)

                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              if (item.product.id !== product.id) {
                                void handleSelectVariant(item.product)
                              } else {
                                void handleSelectImage(item.image)
                              }
                            }}
                            aria-label={item.label}
                            aria-pressed={selected}
                            className={`grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border bg-white p-1 ${
                              selected
                                ? 'border-brand-orange ring-2 ring-orange-100'
                                : 'border-slate-200'
                            }`}
                          >
                            <img
                              src={item.image}
                              alt=""
                              loading="lazy"
                            className="size-full scale-[1.03] object-contain"
                            />
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <div className="relative order-1 grid aspect-square place-items-center p-7 sm:p-10 lg:order-2 lg:min-h-[520px]">
                    <div className="relative size-full overflow-hidden">
                      <AnimatePresence
                        initial={false}
                        custom={slideDirection}
                      >
                        <motion.img
                          key={`${product.id}:${selectedImage || product.image}`}
                          src={selectedImage || product.image}
                          alt={publicName}
                          custom={slideDirection}
                          variants={{
                            enter: (direction: number) => ({
                              x: direction > 0 ? '105%' : '-105%',
                            }),
                            center: { x: 0 },
                            exit: (direction: number) => ({
                              x: direction > 0 ? '-105%' : '105%',
                            }),
                          }}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className={`absolute inset-0 m-auto max-h-full max-w-full scale-[1.02] object-contain ${
                            availability?.tone === 'neutral'
                              ? 'opacity-60 grayscale-[40%]'
                              : ''
                          }`}
                          onError={(event) => {
                            event.currentTarget.src =
                              '/products/dragao-articulado.webp'
                          }}
                        />
                      </AnimatePresence>
                    </div>
                    {availability?.tone === 'neutral' && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-6 pb-6 pt-14 text-center">
                        <p className="text-lg font-black tracking-wider text-white">
                          SEM ESTOQUE
                        </p>
                      </div>
                    )}
                    {/* Share button */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="absolute top-4 right-4 grid size-10 place-items-center rounded-lg border border-black/5 bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition hover:text-brand-aqua-dark"
                      aria-label="Compartilhar"
                    >
                      <Share2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-col p-5 sm:p-7 lg:p-8">
                {/* Category + Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-aqua/15 px-3 py-1.5 text-[10px] font-black tracking-wide text-brand-aqua-dark uppercase">
                    <Layers3 className="size-3" />
                    {product.categoria}
                  </span>
                  {availability && (
                    <span
                      className={`rounded-md px-3 py-1.5 text-[10px] font-black ring-1 ${getAvailabilityClasses(
                        availability.tone,
                      )}`}
                    >
                      {availability.label}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="mt-4 text-2xl leading-tight font-extrabold tracking-[-0.025em] text-slate-700 sm:text-3xl">
                  {productTitle}
                </h1>

                <p className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  {currency.format(product.price)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div
                    className="flex"
                    role="group"
                    aria-label="Avalie este produto"
                  >
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleRating(value)}
                          aria-label={`Dar ${value} estrela${value > 1 ? 's' : ''}`}
                          aria-pressed={userRating === value}
                          className="rounded-sm p-0.5 text-amber-400 transition hover:scale-110 focus-visible:outline-offset-1"
                        >
                          <Star
                            className={`size-4 ${
                              value <= userRating ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {userRating
                      ? `Sua avaliação: ${userRating}/5`
                      : 'Clique para avaliar'}
                  </span>
                </div>

                <div
                  className={`mt-5 rounded-xl border px-4 py-3 ${
                    isPreSale
                      ? 'border-amber-200 bg-amber-50'
                      : availability?.tone === 'available'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p
                    className={`text-[10px] font-black tracking-[0.13em] uppercase ${
                      isPreSale
                        ? 'text-amber-700'
                        : availability?.tone === 'available'
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                    }`}
                  >
                    {isPreSale ? 'Estoque previsto' : availability?.label}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {availabilitySummary}
                  </p>
                  {isPreSale && (
                    <p className="mt-1 text-xs text-amber-700">
                      Garanta a sua unidade falando com nosso atendente.
                    </p>
                  )}
                </div>

                {productVariants.length > 1 && (
                  <section className="mt-5">
                    {product.variantGroup ? (
                      /* ── Variantes de peças/placas: imagem + label + preço ── */
                      <div>
                        <p className="text-sm text-slate-700">
                          Modelo:{' '}
                          <strong className="font-black text-slate-950">
                            {product.variantLabel ?? product.name}
                          </strong>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
                          <span>
                            {currency.format(product.price)}
                          </span>
                          <span>
                            Estoque:{' '}
                            <strong
                              className={
                                product.estoque > 0
                                  ? 'text-emerald-600'
                                  : 'text-red-600'
                              }
                            >
                              {product.estoque > 0
                                ? `${product.estoque} unidade(s)`
                                : 'esgotado'}
                            </strong>
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3">
                          {productVariants.map((variant) => {
                            const variantAvailability =
                              getProductAvailability(variant)
                            const unavailable =
                              variantAvailability.tone === 'neutral'
                            const selected = variant.id === product.id
                            const label =
                              variant.variantLabel ??
                              getProductPublicName(variant)

                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => handleSelectVariant(variant)}
                                title={`${label} — ${currency.format(variant.price)} — ${variantAvailability.label}`}
                                aria-label={`${label}, ${currency.format(variant.price)}, ${variantAvailability.label}`}
                                aria-pressed={selected}
                                className={`group relative flex w-20 flex-col items-center gap-1.5 rounded-2xl border-2 p-2 pb-2.5 text-center transition-all duration-150 hover:-translate-y-0.5 ${
                                  selected
                                    ? 'border-brand-orange bg-orange-50 shadow-[0_0_0_3px_rgba(255,90,0,.10)]'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {/* imagem circular igual filamento */}
                                <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-100 bg-white">
                                  <img
                                    src={variant.image}
                                    alt=""
                                    loading="lazy"
                                    className={`size-full object-contain p-0.5 transition-opacity ${
                                      unavailable ? 'opacity-50 grayscale' : ''
                                    }`}
                                  />
                                  {unavailable && (
                                    <span className="absolute inset-0 grid place-items-center text-red-500">
                                      <X className="size-6 stroke-[3]" aria-hidden="true" />
                                    </span>
                                  )}
                                </span>

                                {/* label */}
                                <span
                                  className={`block text-[11px] font-black leading-tight ${
                                    selected ? 'text-brand-orange' : 'text-slate-700'
                                  }`}
                                >
                                  {label}
                                </span>

                                {/* preço */}
                                <span
                                  className={`block text-[10px] font-bold leading-none ${
                                    selected ? 'text-slate-800' : 'text-slate-400'
                                  }`}
                                >
                                  {currency.format(variant.price)}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      /* ── Variantes de filamentos: bolinhas com imagem ── */
                      <div>
                        <p className="text-sm text-slate-700">
                          Cor:{' '}
                          <strong className="font-black text-slate-950">
                            {selectedOptionName}
                          </strong>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
                          <span>
                            Linha {[productBrand, detailTitle].filter(Boolean).join(' ')} ·{' '}
                            {currency.format(product.price)}
                          </span>
                          <span>
                            Estoque:{' '}
                            <strong
                              className={
                                product.estoque > 0
                                  ? 'text-emerald-600'
                                  : 'text-red-600'
                              }
                            >
                              {product.estoque > 0
                                ? `${product.estoque} unidade(s)`
                                : 'esgotado'}
                            </strong>
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {productVariants.map((variant) => {
                            const variantAvailability =
                              getProductAvailability(variant)
                            const unavailable =
                              variantAvailability.tone === 'neutral'
                            const selected = variant.id === product.id
                            const variantName = getProductPublicName(variant)

                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => handleSelectVariant(variant)}
                                title={`${variantName} — ${variantAvailability.label}`}
                                aria-label={`${variantName}, ${variantAvailability.label}`}
                                aria-pressed={selected}
                                className={`relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 bg-white p-1 transition hover:-translate-y-0.5 ${
                                  selected
                                    ? 'border-brand-orange shadow-[0_0_0_3px_rgba(255,90,0,.12)]'
                                    : 'border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <img
                                  src={variant.image}
                                  alt=""
                                  loading="lazy"
                                  className={`size-full rounded-full object-contain ${
                                    unavailable ? 'opacity-60' : ''
                                  }`}
                                />
                                {unavailable && (
                                  <span className="absolute inset-0 grid place-items-center text-red-600">
                                    <X
                                      className="size-7 stroke-[3]"
                                      aria-hidden="true"
                                    />
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* Trust signals */}
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    { icon: Truck, text: 'Envio todo Brasil' },
                    { icon: BadgeCheck, text: 'Original garantido' },
                    { icon: Star, text: 'Suporte técnico' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[10px] text-slate-500">
                      <Icon className="size-4 shrink-0 text-brand-aqua-dark" />
                      <span className="font-medium">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Message */}
                {message && (
                  <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 ring-1 ring-green-100">
                    {message}
                  </p>
                )}

                {/* Actions */}
                {availability?.canContact ? (
                  <div className="mt-7 space-y-3">
                    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                      <div className="flex h-13 items-center justify-between rounded-lg border border-slate-200 bg-white px-2">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((current) => Math.max(1, current - 1))
                          }
                          disabled={quantity <= 1}
                          aria-label="Diminuir quantidade"
                          className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <Minus className="size-4" />
                        </button>
                        <strong className="min-w-5 text-center text-sm text-slate-950">
                          {quantity}
                        </strong>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((current) =>
                              Math.min(maximumQuantity, current + 1),
                            )
                          }
                          disabled={quantity >= maximumQuantity}
                          aria-label="Aumentar quantidade"
                          className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleAddToCart()}
                        disabled={addingToCart}
                        className="group inline-flex h-13 min-w-0 items-center justify-center gap-2 rounded-lg bg-black px-4 text-xs font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-60 sm:text-sm"
                      >
                        <ShoppingCart className="size-5 shrink-0" />
                        {addingToCart
                          ? 'Adicionando...'
                          : 'Adicionar ao carrinho'}
                      </button>
                    </div>
                    <a
                      href={getProductWhatsappUrl(product)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <MessageCircle className="size-5" />
                      Falar com atendente
                    </a>
                  </div>
                ) : (
                  <a
                    href={getProductRestockWhatsappUrl(product)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <MessageCircle className="size-5" />
                    Perguntar previsão de reposição
                  </a>
                )}
              </div>
            </motion.section>

            <section className="surface-card mt-7 rounded-2xl p-6 sm:p-8">
              <p className="text-[10px] font-black tracking-[0.18em] text-brand-orange uppercase">
                Detalhes do produto
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Descrição
              </h2>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
                {product.description}
              </p>
              <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Categoria', product.categoria],
                  ['Marca', productBrand ?? 'ToffBrasil'],
                  ['Material', productMaterial ?? 'Não informado'],
                  [
                    'Disponibilidade',
                    product.estoque > 0
                      ? `${product.estoque} unidade(s) em estoque`
                      : availability?.label ?? 'Indisponível',
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <dt className="text-[9px] font-black tracking-[0.14em] text-slate-400 uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-xs font-extrabold text-slate-800">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {similarProducts.length > 0 && (
              <section className="mt-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-brand-orange uppercase">
                      Você também pode gostar
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-navy">
                      Produtos similares
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Alternativas disponíveis para continuar sua compra.
                    </p>
                  </div>
                  <Link
                    to="/catalogo"
                    className="text-xs font-extrabold text-brand-orange hover:text-brand-orange-dark"
                  >
                    Ver catálogo completo →
                  </Link>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {similarProducts.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </section>
            )}
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-bold text-red-700">
                {message || 'Produto não encontrado.'}
              </p>
              <Link
                to="/catalogo"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange"
              >
                <ArrowLeft className="size-4" />
                Voltar ao catálogo
              </Link>
            </div>
          )}
        </div>
      </main>

      {showStickyPurchase && product && availability && (
        <div className="fixed inset-x-0 bottom-0 z-30 hidden border-t border-slate-200 bg-white/95 shadow-[0_-12px_35px_rgba(15,23,42,.12)] backdrop-blur sm:block">
          <div className="container-store flex h-[78px] items-center gap-4">
            <img
              src={selectedImage || product.image}
              alt=""
              className="size-14 shrink-0 rounded-lg bg-slate-50 object-contain p-1"
            />
            <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-950">
              {publicName}
            </p>
            <p className="shrink-0 text-base font-black text-slate-950">
              {currency.format(product.price)}
            </p>
            {availability.canContact ? (
              <button
                type="button"
                onClick={() => void handleAddToCart()}
                disabled={addingToCart}
                className="inline-flex h-11 w-64 shrink-0 items-center justify-center rounded-lg bg-black px-6 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {addingToCart ? 'Adicionando...' : 'Comprar'}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="h-11 w-64 shrink-0 rounded-lg bg-slate-100 text-xs font-black text-slate-400"
              >
                Esgotado
              </button>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
