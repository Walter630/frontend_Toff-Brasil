import { LockKeyhole, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'

type ComingSoonPageProps = {
  title?: string
  description?: string
}

export function ComingSoonPage({
  title = 'Area em breve',
  description = 'Esta rota esta reservada, mas ainda nao foi liberada para uso. Mantemos a tela bloqueada para evitar erros enquanto o backend e as integracoes finais sao implementados.',
}: ComingSoonPageProps) {
  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <section className="rounded-2xl border border-dashed bg-white p-10 text-center sm:p-14">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-brand-orange">
            <Wrench className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-brand-navy">{title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            {description}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
            <LockKeyhole className="size-4" />
            Em breve
          </span>
          <div className="mt-7">
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
            >
              Voltar ao catalogo
            </Link>
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
