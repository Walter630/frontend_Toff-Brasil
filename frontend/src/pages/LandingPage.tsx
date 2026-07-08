import {
  ArrowRight,
  BadgeCheck,
  Box,
  Layers3,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer } from '../components/layout/Footer'
import { products } from '../features/catalog/products'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const benefits = [
  {
    icon: Sparkles,
    title: 'Design e acabamento',
    description:
      'Peças produzidas com atenção aos detalhes e acabamento consistente.',
  },
  {
    icon: Layers3,
    title: 'Materiais variados',
    description:
      'Opções em diferentes filamentos para cada tipo de uso e projeto.',
  },
  {
    icon: PackageCheck,
    title: 'Produção organizada',
    description:
      'Consulte disponibilidade, categorias e informações antes de escolher.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/brand/logo-toffbr.jpeg"
              alt="Toff Brasil"
              className="size-10 rounded-lg bg-white object-contain p-1"
            />
            <span className="text-lg font-bold text-brand-navy">Toff Brasil</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#catalogo" className="hover:text-brand-orange">
              Catálogo
            </a>
            <a href="#como-funciona" className="hover:text-brand-orange">
              Como funciona
            </a>
            <a href="#sobre" className="hover:text-brand-orange">
              Sobre
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-slate-100"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="hidden rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark sm:block"
            >
              Criar conta
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-brand-navy text-white">
          <div className="absolute -left-24 top-20 size-96 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-brand-orange/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
                <Box className="size-4" />
                Impressão 3D sob demanda
              </span>
              <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Ideias que saem da tela e ganham forma.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100/70">
                Conheça produtos impressos em 3D, explore materiais e encontre
                peças criativas para decorar, organizar e facilitar sua rotina.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-semibold text-white hover:bg-brand-orange-dark"
                >
                  Explorar catálogo
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-6 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Conhecer a Toff Brasil
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-100/70">
                {['Peças detalhadas', 'Materiais selecionados', 'Produção local'].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-2">
                      <BadgeCheck className="size-4 text-brand-orange" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute inset-8 rounded-full bg-brand-orange/30 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product, index) => (
                  <div
                    key={product.id}
                    className={
                      index % 2 === 1
                        ? 'translate-y-8 overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur'
                        : 'overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur'
                    }
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="catalogo" className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-orange">
                Nosso catálogo
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
                Produtos que unem forma e função
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange"
            >
              Ver catálogo completo
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                to="/dashboard"
                key={product.id}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                    {product.categoria}
                  </p>
                  <h3 className="mt-2 font-bold text-brand-navy">
                    {product.name}
                  </h3>
                  <p className="mt-3 font-bold text-brand-orange">
                    {currency.format(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="bg-brand-surface py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-brand-orange">
                Por que escolher a Toff Brasil
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
                Simples para encontrar. Bem-feito para durar.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border bg-white p-7 shadow-sm"
                >
                  <div className="grid size-12 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-brand-navy">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl bg-brand-navy px-7 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Pronto para conhecer o catálogo?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-blue-100/70">
              Crie sua conta para consultar o catálogo completo, filtrar
              categorias e visualizar os detalhes das peças.
            </p>
            <Link
              to="/cadastro"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-semibold text-white hover:bg-brand-orange-dark"
            >
              Criar minha conta
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
