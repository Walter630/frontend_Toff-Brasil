import type { FormEvent } from 'react'

import {
  BellRing,
  Eye,
  KeyRound,
  LoaderCircle,
  Save,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { getApiErrorMessage } from '../lib/api-error'
import { authService } from '../services/auth-service'
import { userService } from '../services/user-service'

const preferencesKey = 'toffbr:user-preferences'

type UserPreferences = {
  emailNotifications: boolean
  orderNotifications: boolean
  promotions: boolean
  largerText: boolean
  highContrast: boolean
  reduceMotion: boolean
}

const defaultPreferences: UserPreferences = {
  emailNotifications: true,
  orderNotifications: true,
  promotions: false,
  largerText: false,
  highContrast: false,
  reduceMotion: false,
}

function loadPreferences() {
  const stored = localStorage.getItem(preferencesKey)

  if (!stored) {
    return defaultPreferences
  }

  try {
    return {
      ...defaultPreferences,
      ...(JSON.parse(stored) as Partial<UserPreferences>),
    }
  } catch {
    return defaultPreferences
  }
}

function PreferenceToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white p-4 transition hover:border-orange-200">
      <span>
        <span className="block font-semibold text-brand-navy">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-brand-orange"
      />
    </label>
  )
}

export function SettingsPage() {
  const user = authService.getUser()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(preferencesKey, JSON.stringify(preferences))
  }, [preferences])

  function updatePreference(key: keyof UserPreferences, value: boolean) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }))
    setMessage('Preferencia salva neste dispositivo.')
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setMessage('')

    try {
      await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      })
      setMessage('Perfil atualizado.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel atualizar o perfil.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (newPassword !== confirmPassword) {
      setMessage('A nova senha e a confirmacao precisam ser iguais.')
      return
    }

    if (newPassword.length < 6) {
      setMessage('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setSavingPassword(true)

    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Senha alterada com sucesso.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel alterar a senha.'))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="px-4 py-5 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <p className="text-sm font-semibold text-brand-orange">
              Configuracoes
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Preferencias da conta
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ajuste seus dados, notificacoes, acessibilidade e senha.
            </p>
          </section>

          {message && (
            <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
              {message}
            </p>
          )}

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <form
              onSubmit={handleProfileSubmit}
              className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <UserRound className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-orange">
                    Usuario
                  </p>
                  <h2 className="font-bold text-brand-navy">Perfil</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <Input
                  id="settings-name"
                  label="Nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                />
                <Input
                  id="settings-email"
                  label="E-mail"
                  value={user?.email ?? ''}
                  disabled
                />
                <Input
                  id="settings-phone"
                  label="Telefone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <Button className="mt-5 w-full" disabled={savingProfile}>
                {savingProfile ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Salvar perfil
              </Button>
            </form>

            <form
              onSubmit={handlePasswordSubmit}
              className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <KeyRound className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-orange">
                    Seguranca
                  </p>
                  <h2 className="font-bold text-brand-navy">Mudar senha</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <Input
                  id="current-password"
                  label="Senha atual"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
                <Input
                  id="new-password"
                  label="Nova senha"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <Input
                  id="confirm-password"
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <Button className="mt-5 w-full" disabled={savingPassword}>
                {savingPassword ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                Alterar senha
              </Button>
            </form>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <BellRing className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-orange">
                    Notificacoes
                  </p>
                  <h2 className="font-bold text-brand-navy">Preferencias</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <PreferenceToggle
                  title="Atualizacoes por e-mail"
                  description="Receber mensagens importantes sobre a conta."
                  checked={preferences.emailNotifications}
                  onChange={(value) =>
                    updatePreference('emailNotifications', value)
                  }
                />
                <PreferenceToggle
                  title="Pedidos e pagamentos"
                  description="Avisos sobre compra, pagamento e andamento do pedido."
                  checked={preferences.orderNotifications}
                  onChange={(value) =>
                    updatePreference('orderNotifications', value)
                  }
                />
                <PreferenceToggle
                  title="Promocoes"
                  description="Receber ofertas e novidades da loja."
                  checked={preferences.promotions}
                  onChange={(value) => updatePreference('promotions', value)}
                />
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <Eye className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-orange">
                    Acessibilidade
                  </p>
                  <h2 className="font-bold text-brand-navy">Conforto visual</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <PreferenceToggle
                  title="Texto maior"
                  description="Preferencia salva para proximas melhorias visuais."
                  checked={preferences.largerText}
                  onChange={(value) => updatePreference('largerText', value)}
                />
                <PreferenceToggle
                  title="Mais contraste"
                  description="Aumentar destaque visual quando liberado no tema."
                  checked={preferences.highContrast}
                  onChange={(value) => updatePreference('highContrast', value)}
                />
                <PreferenceToggle
                  title="Reduzir movimentos"
                  description="Diminuir animacoes e transicoes."
                  checked={preferences.reduceMotion}
                  onChange={(value) => updatePreference('reduceMotion', value)}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
