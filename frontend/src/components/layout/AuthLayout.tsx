import type { ReactNode } from 'react'

import { Boxes, Layers3, Sparkles } from 'lucide-react'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  description: string
}

export function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-navy px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute -left-32 top-1/3 size-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img
            src="/brand/logo-toffbr.jpeg"
            alt="Toff Brasil"
            className="size-14 rounded-xl bg-white object-contain p-1"
          />
          <span className="text-xl font-bold">Toff Brasil</span>
        </div>

        <div className="relative my-auto max-w-xl">
          <span className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">
            Catálogo inteligente
          </span>
          <h1 className="text-5xl font-semibold leading-tight">
            Organize sua produção 3D em um só lugar.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100/75">
            Gerencie impressões, filamentos, categorias e disponibilidade com
            uma visão clara do seu catálogo.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              [Boxes, 'Impressões'],
              [Layers3, 'Filamentos'],
              [Sparkles, 'Catálogo'],
            ].map(([Icon, label]) => {
              const ItemIcon = Icon
              return (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <ItemIcon className="mb-4 size-5 text-brand-orange" />
                  <p className="text-sm font-medium">{String(label)}</p>
                </div>
              )
            })}
          </div>
        </div>

        <p className="relative text-xs text-blue-100/50">
          Impressão 3D com organização e identidade.
        </p>
      </section>

      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <img
              src="/brand/logo-toffbr.jpeg"
              alt="Toff Brasil"
              className="size-12 rounded-xl bg-white object-contain p-1"
            />
            <span className="text-xl font-bold text-brand-navy">Toff Brasil</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  )
}
