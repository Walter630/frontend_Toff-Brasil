import { Box, LockKeyhole, Megaphone, ShoppingBag } from 'lucide-react'

import { DashboardLayout } from '../components/layout/DashboardLayout'

const integrations = [
  {
    name: 'Shopee',
    description: 'Sincronização de produtos, estoque e pedidos.',
    icon: ShoppingBag,
  },
  {
    name: 'Amazon',
    description: 'Catálogo, ofertas, estoque e pedidos do marketplace.',
    icon: Box,
  },
  {
    name: 'Facebook / Instagram',
    description: 'Catálogo Meta Commerce e anúncios de produtos.',
    icon: Megaphone,
  },
]

export function IntegrationsPage() {
  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <h1 className="text-3xl font-bold text-brand-navy">Integrações</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Esta página prepara o frontend. A conexão real deve ser implementada
          no backend para proteger segredos, renovar tokens e receber webhooks.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {integrations.map(({ name, description, icon: Icon }) => (
            <article key={name} className="rounded-2xl border bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="grid size-12 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <Icon className="size-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Requer backend
                </span>
              </div>
              <h2 className="mt-6 text-lg font-bold text-brand-navy">{name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {description}
              </p>
              <button
                disabled
                className="mt-6 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-400"
              >
                <LockKeyhole className="size-4" />
                Aguardando API
              </button>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-sm leading-6 text-brand-navy">
          <strong>O backend precisará fornecer:</strong> início e callback OAuth,
          armazenamento criptografado dos tokens, status da conexão,
          sincronização de produtos/estoque e endpoints para webhooks de pedidos.
        </section>
      </main>
    </DashboardLayout>
  )
}
