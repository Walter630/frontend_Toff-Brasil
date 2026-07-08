import { PackageSearch } from 'lucide-react'

import { DashboardLayout } from '../components/layout/DashboardLayout'

export function OrdersPage() {
  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <h1 className="text-3xl font-bold text-brand-navy">Meus pedidos</h1>
        <div className="mt-8 rounded-2xl border border-dashed bg-white p-14 text-center">
          <PackageSearch className="mx-auto size-9 text-slate-300" />
          <h2 className="mt-4 font-bold text-brand-navy">
            Histórico de pedidos em preparação
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            O backend ainda não expõe uma rota de pedidos. A página está pronta
            para receber essa integração quando o endpoint for criado.
          </p>
        </div>
      </main>
    </DashboardLayout>
  )
}
