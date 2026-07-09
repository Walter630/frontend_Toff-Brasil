import {
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  Settings,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../lib/api-error'
import { authService } from '../services/auth-service'
import { userService } from '../services/user-service'
import type { UserResponse } from '../types/auth'

export function AccountPage() {
  const [user, setUser] = useState<UserResponse | null>(authService.getUser())
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadProfile() {
    setLoading(true)
    setMessage('')

    try {
      const localUser = authService.getUser()
      const profile = await userService.getProfile()

      setUser({
        ...profile,
        role: localUser?.role ?? profile.role,
      })
    } catch (error) {
      setMessage(
        getApiErrorMessage(
          error,
          'Nao foi possivel carregar o perfil no backend. Exibindo sessao local.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  return (
    <DashboardLayout>
      <main className="px-4 py-5 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-orange">
                  Minha conta
                </p>
                <h1 className="mt-1 text-3xl font-bold text-brand-navy">
                  Perfil do usuario
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Veja seus dados principais e acesse as configuracoes da conta.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => void loadProfile()}>
                  <RefreshCw className="size-4" />
                  Atualizar
                </Button>
                <Link
                  to="/configuracoes"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
                >
                  <Settings className="size-4" />
                  Configuracoes
                </Link>
              </div>
            </div>
          </section>

          {message && (
            <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
              {message}
            </p>
          )}

          <section className="mt-6 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-orange-50 text-brand-orange">
                {loading ? (
                  <LoaderCircle className="size-8 animate-spin" />
                ) : (
                  <UserRound className="size-8" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold text-brand-navy">
                  {user?.name || 'Usuario Toff Brasil'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Dados usados para pedidos e atendimento.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <Mail className="size-5 text-brand-orange" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    E-mail
                  </p>
                  <p className="truncate font-semibold text-brand-navy">
                    {user?.email || 'E-mail nao disponivel'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <Phone className="size-5 text-brand-orange" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Telefone
                  </p>
                  <p className="font-semibold text-brand-navy">
                    {user?.phone || 'Nao informado'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
