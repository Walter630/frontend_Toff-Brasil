import { ArrowRight, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { getApiErrorMessage } from '../lib/api-error'
import { authService } from '../services/auth-service'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const registrationSuccess = Boolean(
    (location.state as { registrationSuccess?: boolean } | null)
      ?.registrationSuccess,
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)

    try {
      await authService.login(
        {
          email: String(form.get('email')),
          password: String(form.get('password')),
        },
        form.get('remember') === 'on',
      )

      const destination =
        (location.state as { from?: string } | null)?.from ??
        (authService.canManageStore() ? '/admin' : '/dashboard')
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'E-mail ou senha inválidos. Confira os dados e tente novamente.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Entrar na sua conta"
      description="Acesse para explorar o catálogo completo, adicionar produtos ao carrinho e acompanhar seus pedidos."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {registrationSuccess && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Conta criada com sucesso. Faça login para continuar.
          </p>
        )}
        <Input
          id="email"
          name="email"
          label="E-mail"
          type="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          required
        />
        <Input
          id="password"
          name="password"
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          minLength={8}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              name="remember"
              type="checkbox"
              className="size-4 rounded border-slate-300 accent-brand-orange"
            />
            Lembrar de mim
          </label>
          <button type="button" className="font-semibold text-brand-orange">
            Esqueci minha senha
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 w-full bg-black text-white hover:bg-slate-800 hover:text-white"
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <LockKeyhole className="size-4" />
          )}
          {loading ? 'Entrando...' : 'Entrar'}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-brand-orange">
          Criar conta
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-slate-500">
        Quer apenas ver os produtos?{' '}
        <Link to="/catalogo" className="font-semibold text-brand-orange">
          Ir para o catálogo
        </Link>
      </p>
    </AuthLayout>
  )
}
