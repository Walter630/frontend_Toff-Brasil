import { ArrowRight, LoaderCircle, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { getApiErrorMessage } from '../lib/api-error'
import { authService } from '../services/auth-service'

export function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))
    const passwordConfirmation = String(form.get('passwordConfirmation'))

    if (password !== passwordConfirmation) {
      setError('As senhas informadas não são iguais.')
      return
    }

    setLoading(true)

    try {
      await authService.register({
        name: String(form.get('name')),
        email: String(form.get('email')),
        phone: String(form.get('phone')),
        password,
        role: 'USER',
      })

      navigate('/login', {
        replace: true,
        state: { registrationSuccess: true },
      })
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Não foi possível criar a conta. Confira os dados e tente novamente.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      description="Comece a organizar seu catálogo de impressões e filamentos."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          id="name"
          name="name"
          label="Nome completo"
          placeholder="Seu nome"
          autoComplete="name"
          required
        />
        <Input
          id="register-email"
          name="email"
          label="E-mail"
          type="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          required
        />
        <Input
          id="phone"
          name="phone"
          label="Telefone"
          type="tel"
          placeholder="(00) 00000-0000"
          autoComplete="tel"
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="register-password"
            name="password"
            label="Senha"
            type="password"
            placeholder="Mín. 8 caracteres"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Input
            id="confirm-password"
            name="passwordConfirmation"
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-slate-500">
          <input
            type="checkbox"
            required
            className="mt-1 size-4 rounded border-slate-300 accent-brand-orange"
          />
          <span>
            Concordo com os termos de uso e com a política de privacidade.
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {loading ? 'Criando conta...' : 'Criar conta'}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Já possui uma conta?{' '}
        <Link to="/login" className="font-semibold text-brand-orange">
          Fazer login
        </Link>
      </p>
    </AuthLayout>
  )
}
