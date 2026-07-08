import { Heart, LockKeyhole } from 'lucide-react'

import { DashboardLayout } from '../components/layout/DashboardLayout'

export function FavoritesPage() {
  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <h1 className="text-3xl font-bold text-brand-navy">Favoritos</h1>
        <p className="mt-2 text-sm text-slate-500">
          Este recurso depende de persistência no backend.
        </p>
        <div className="mt-8 rounded-2xl border border-dashed bg-white p-14 text-center">
          <Heart className="mx-auto size-9 text-slate-300" />
          <p className="mt-4 font-semibold text-brand-navy">
            Favoritos indisponíveis
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            A tela será liberada quando o backend fornecer as rotas para
            salvar, listar e remover favoritos do usuário.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
            <LockKeyhole className="size-4" />
            Aguardando API
          </span>
        </div>
      </main>
    </DashboardLayout>
  )
}
