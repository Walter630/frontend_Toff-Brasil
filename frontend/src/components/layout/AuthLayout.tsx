import type { ReactNode } from 'react'

import { ArrowLeft, Headphones, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  description: string
}

const storeBenefits = [
  {
    icon: Truck,
    title: 'Envio para todo o Brasil',
    description: 'Acompanhe seus pedidos em um só lugar.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    description: 'Seus dados e sua conta ficam protegidos.',
  },
  {
    icon: Headphones,
    title: 'Suporte especializado',
    description: 'Atendimento de quem entende de impressão 3D.',
  },
]

export function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f4f4f5] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-black px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div className="absolute -top-24 -left-20 size-80 rounded-full bg-brand-orange/20 blur-[90px]" />
        <div className="absolute -right-32 -bottom-32 size-[28rem] rounded-full border-[80px] border-white/[0.025]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        <Link to="/" className="relative inline-flex w-fit items-center gap-3">
          <span className="grid size-11 place-items-center overflow-hidden rounded-xl bg-white p-1">
            <img
              src="/brand/logo-toffbr.jpeg"
              alt="Toff Brasil"
              className="size-full object-contain"
            />
          </span>
          <span>
            <strong className="block text-lg font-black tracking-tight">
              Toff Brasil
            </strong>
            <small className="block text-[9px] font-bold tracking-[0.15em] text-white/40 uppercase">
              Impressão 3D
            </small>
          </span>
        </Link>

        <div className="relative my-auto max-w-xl py-12">
          <span className="inline-flex rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-orange-300 uppercase">
            Sua loja 3D
          </span>
          <h1 className="mt-6 text-4xl leading-[1.08] font-black tracking-tight xl:text-5xl">
            Sua próxima impressão começa aqui.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/55 xl:text-base">
            Entre para salvar seu carrinho, acompanhar pedidos e encontrar os
            materiais certos para cada projeto.
          </p>

          <div className="mt-10 grid gap-3">
            {storeBenefits.map(({ icon: Icon, title: benefitTitle, description: benefitDescription }) => (
              <div
                key={benefitTitle}
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-orange text-white">
                  <Icon className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">{benefitTitle}</strong>
                  <small className="mt-0.5 block text-xs text-white/45">
                    {benefitDescription}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[10px] font-semibold tracking-wide text-white/30">
          © {new Date().getFullYear()} ToffBrasil
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.1)] sm:p-9">
          <div className="mb-7 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-brand-orange"
            >
              <ArrowLeft className="size-4" />
              Voltar à loja
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 lg:hidden">
              <span className="grid size-9 place-items-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5">
                <img
                  src="/brand/logo-toffbr.jpeg"
                  alt="Toff Brasil"
                  className="size-full object-contain"
                />
              </span>
              <strong className="text-sm font-black text-slate-950">
                Toff Brasil
              </strong>
            </Link>
          </div>

          <p className="text-[10px] font-black tracking-[0.17em] text-brand-orange uppercase">
            Área do cliente
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  )
}
