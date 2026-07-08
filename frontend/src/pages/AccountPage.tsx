import { Mail, UserRound } from 'lucide-react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { authService } from '../services/auth-service'

export function AccountPage() {
  const user = authService.getUser()

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <h1 className="text-3xl font-bold text-brand-navy">Minha conta</h1>
        <section className="mt-8 max-w-2xl rounded-2xl border bg-white p-7">
          <div className="grid size-16 place-items-center rounded-full bg-orange-50 text-brand-orange">
            <UserRound className="size-8" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-brand-navy">
            {user?.name ?? 'Usuário Toff Brasil'}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Mail className="size-4" />
            {user?.email ?? 'E-mail não disponível'}
          </p>
          <p className="mt-7 rounded-xl bg-blue-50 p-4 text-sm text-brand-navy">
            O backend atual possui apenas a listagem geral de usuários, sem uma
            rota de perfil individual. Os dados exibidos vêm da sessão de login.
          </p>
        </section>
      </main>
    </DashboardLayout>
  )
}
