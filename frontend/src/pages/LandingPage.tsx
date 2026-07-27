import {
  ArrowRight,
  BadgeCheck,
  Box,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Layers3,
  PackageCheck,
  Printer,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ProductCard } from '../components/catalog/ProductCard'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useProducts } from '../hooks/useProducts'
import { getProductAvailability } from '../lib/product-status'

const categories = [
  {
    title: 'Filamentos',
    subtitle: 'PLA, PETG, ABS, TPU e especiais',
    icon: Layers3,
    accent: 'bg-brand-aqua',
    to: '/catalogo?grupo=FILAMENTOS',
  },
  {
    title: 'Impressoras 3D',
    subtitle: 'Equipamentos para hobby e produção',
    icon: Printer,
    accent: 'bg-brand-orange',
    to: '/catalogo?grupo=IMPRESSORAS',
  },
  {
    title: 'Peças e upgrades',
    subtitle: 'Hotends, bicos, placas e reposição',
    icon: Wrench,
    accent: 'bg-amber-400',
    to: '/catalogo?grupo=ACESSORIOS',
  },
  {
    title: 'Pré-venda',
    subtitle: 'Reserve novidades antes da chegada',
    icon: Box,
    accent: 'bg-violet-400',
    to: '/catalogo?prevenda=1',
  },
]

const benefits = [
  {
    icon: Truck,
    title: 'Envio nacional',
    text: 'Postagem rápida para todo o Brasil',
  },
  {
    icon: ShieldCheck,
    title: 'Compra protegida',
    text: 'Pagamento seguro e dados protegidos',
  },
  {
    icon: BadgeCheck,
    title: 'Curadoria técnica',
    text: 'Produtos escolhidos por especialistas',
  },
  {
    icon: Headphones,
    title: 'Suporte de verdade',
    text: 'Ajuda antes e depois da sua compra',
  },
]

export function LandingPage() {
  const { products, loading } = useProducts()
  const availableProducts = products.filter(
    (product) =>
      product.ativo && getProductAvailability(product).tone !== 'neutral',
  )
  const selectedFeatured = availableProducts.filter(
    (product) => product.featured,
  )
  const featured = (
    selectedFeatured.length ? selectedFeatured : availableProducts
  ).slice(0, 8)
  const [activeHero, setActiveHero] = useState(0)
  const heroProducts = featured.slice(0, 4)
  const heroProduct = heroProducts[activeHero % Math.max(heroProducts.length, 1)]
  const secondaryProducts = heroProducts.filter(
    (product) => product.id !== heroProduct?.id,
  )

  useEffect(() => {
    if (heroProducts.length <= 1) return
    const interval = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroProducts.length)
    }, 5500)

    return () => window.clearInterval(interval)
  }, [heroProducts.length])

  return (
    <DashboardLayout>
      <main>
        <section className="relative overflow-hidden bg-brand-navy text-white">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
              backgroundSize: '34px 34px',
              maskImage:
                'linear-gradient(to bottom, black, transparent 88%)',
            }}
          />
          <div className="container-store relative grid items-center gap-8 py-8 lg:min-h-[560px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-10 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/15 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-brand-orange uppercase">
                <Zap className="size-3.5" />
                Especialistas em impressão 3D
              </div>
              <h1 className="mt-5 max-w-2xl text-3xl leading-[1.02] font-black tracking-[-0.04em] text-white sm:text-5xl lg:mt-6 lg:text-[4.3rem]">
                Sua próxima ideia começa{' '}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10">aqui.</span>
                  <span className="absolute right-0 bottom-1 left-0 h-3 -rotate-1 bg-brand-orange/80" />
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:mt-6 sm:text-lg sm:leading-7">
                Filamentos, impressoras e componentes selecionados para você
                imprimir melhor, produzir mais e tirar projetos do papel.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                <Link
                  to="/catalogo"
                  className="group inline-flex h-13 items-center gap-3 rounded-lg bg-brand-orange px-7 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(255,90,0,.22)] transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-navy"
                >
                  Explorar catálogo
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/55">
                <span className="flex items-center gap-2">
                  <PackageCheck className="size-4 text-brand-orange" />
                  Produtos originais
                </span>
                <span className="flex items-center gap-2">
                  <Truck className="size-4 text-brand-orange" />
                  Entrega em todo Brasil
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.65 }}
              className="relative"
            >
              <div className="absolute -top-16 right-0 size-80 rounded-full bg-brand-orange/20 blur-3xl" />
              <div className="absolute -bottom-20 left-12 size-72 rounded-full bg-brand-orange/10 blur-3xl" />
              <div className="relative grid grid-cols-[1fr_106px] gap-3 sm:grid-cols-[1fr_132px]">
                <Link
                  to={heroProduct ? `/produtos/${heroProduct.id}` : '/catalogo'}
                  className="group surface-card relative grid min-h-[330px] place-items-center overflow-hidden rounded-[2rem] p-5 sm:min-h-[480px] sm:p-8"
                >
                  <span className="absolute top-5 left-5 rounded-full bg-brand-navy px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-white uppercase">
                    Destaque da semana
                  </span>
                  {heroProduct ? (
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name}
                      className="max-h-[245px] max-w-full object-contain transition duration-700 group-hover:scale-105 sm:max-h-[400px]"
                    />
                  ) : (
                    <div className="size-52 animate-pulse rounded-full bg-slate-100" />
                  )}
                  <div className="absolute right-5 bottom-5 left-5 rounded-2xl bg-brand-navy/95 p-4 text-white shadow-xl backdrop-blur">
                    <p className="line-clamp-1 text-sm font-extrabold">
                      {heroProduct?.name ?? 'Tecnologia para suas melhores impressões'}
                    </p>
                    <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-brand-aqua">
                      Ver produto <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>

                <div className="grid gap-3">
                  {secondaryProducts.length
                    ? secondaryProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/produtos/${product.id}`}
                          className="surface-card group grid min-h-28 place-items-center overflow-hidden rounded-2xl p-3"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-24 max-w-full object-contain transition duration-500 group-hover:scale-110 sm:max-h-32"
                          />
                        </Link>
                      ))
                    : Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="surface-card animate-pulse rounded-2xl bg-slate-100"
                        />
                      ))}
                </div>
              </div>
              {heroProducts.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Produto anterior"
                    onClick={() =>
                      setActiveHero(
                        (current) =>
                          (current - 1 + heroProducts.length) %
                          heroProducts.length,
                      )
                    }
                    className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-brand-orange"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    {heroProducts.map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        aria-label={`Mostrar ${product.name}`}
                        onClick={() => setActiveHero(index)}
                        className={
                          index === activeHero % heroProducts.length
                            ? 'h-2 w-7 rounded-full bg-brand-orange'
                            : 'size-2 rounded-full bg-white/30'
                        }
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Próximo produto"
                    onClick={() =>
                      setActiveHero(
                        (current) => (current + 1) % heroProducts.length,
                      )
                    }
                    className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-brand-orange"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="border-y border-orange-400/20 bg-brand-orange text-white">
          <div className="container-store grid grid-cols-2 divide-x divide-white/10 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex min-h-28 items-center gap-3 border-b border-white/10 px-4 py-5 last:border-b-0 lg:border-b-0 lg:px-6"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
                  <Icon className="size-5" />
                </span>
                <span>
                  <strong className="block text-xs sm:text-sm">{title}</strong>
                  <small className="mt-1 hidden leading-4 text-white/45 sm:block">
                    {text}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="container-store py-14 sm:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-black tracking-[0.18em] text-brand-aqua-dark uppercase">
                Encontre mais rápido
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                Compre por categoria
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="hidden items-center gap-2 text-sm font-extrabold text-brand-navy hover:text-brand-aqua-dark sm:flex"
            >
              Ver todas <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ title, subtitle, icon: Icon, accent, to }) => (
              <Link
                key={title}
                to={to}
                className="group surface-card relative flex min-h-36 items-center gap-5 overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span
                  className={`absolute top-0 bottom-0 left-0 w-1.5 ${accent}`}
                />
                <span
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl ${accent} text-brand-navy transition group-hover:rotate-3 group-hover:scale-105`}
                >
                  <Icon className="size-6" />
                </span>
                <span>
                  <strong className="block text-base text-brand-navy">
                    {title}
                  </strong>
                  <small className="mt-1 block leading-4 text-slate-500">
                    {subtitle}
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <div className="container-store">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.18em] text-brand-orange uppercase">
                  <Sparkles className="size-3.5" />
                  Seleção Toff
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                  Produtos em destaque
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Escolhas certeiras para elevar a qualidade das suas impressões.
                </p>
              </div>
              <Link
                to="/catalogo"
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-aqua px-5 py-3 text-xs font-extrabold text-brand-navy transition hover:bg-brand-navy hover:text-white"
              >
                Catálogo completo
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[0.72] animate-pulse rounded-2xl bg-slate-100"
                    />
                  ))
                : featured.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          </div>
        </section>

        <section className="container-store py-14 sm:py-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-aqua px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12">
            <div className="absolute -top-20 -right-10 size-64 rounded-full border-[36px] border-white/20" />
            <div className="relative">
              <p className="text-[11px] font-black tracking-[0.18em] uppercase">
                Atendimento consultivo
              </p>
              <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
                Não sabe qual material ou equipamento escolher?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-navy/70">
                Conte seu projeto para a nossa equipe. A gente ajuda você a
                encontrar a solução certa, sem complicação.
              </p>
            </div>
            <a
              href="https://wa.me/553488560330"
              target="_blank"
              rel="noreferrer"
              className="relative mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-brand-navy px-6 text-sm font-extrabold text-white shadow-xl transition hover:-translate-y-0.5 lg:mt-0"
            >
              Conversar agora
              <ArrowRight className="size-4" />
            </a>
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
