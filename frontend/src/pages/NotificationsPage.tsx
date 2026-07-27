import type { FormEvent } from 'react'

import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Send,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { getApiErrorMessage } from '../lib/api-error'
import {
  notificationService,
  type ManagerAlert,
} from '../services/notification-service'

export function NotificationsPage() {
  const [alerts, setAlerts] = useState<ManagerAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const openAlerts = useMemo(
    () => alerts.filter((alert) => alert.severity !== 'Resolvido').length,
    [alerts],
  )

  async function loadAlerts() {
    setLoading(true)
    setMessage('')

    try {
      setAlerts(await notificationService.list())
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, 'Nao foi possivel carregar notificacoes.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!title.trim() || !description.trim()) {
      return
    }

    setSaving(true)

    try {
      const createdAlert = await notificationService.create({
        title: title.trim(),
        description: description.trim(),
      })

      setAlerts((current) => [createdAlert, ...current])
      setTitle('')
      setDescription('')
      setMessage('Notificacao enviada ao backend.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel criar notificacao.'))
    } finally {
      setSaving(false)
    }
  }

  const resolveAlert = async (id: string) => {
    setMessage('')

    try {
      const resolvedAlert = await notificationService.resolve(id)
      setAlerts((current) =>
        current.map((alert) => (alert.id === id ? resolvedAlert : alert)),
      )
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, 'Nao foi possivel resolver notificacao.'),
      )
    }
  }

  useEffect(() => {
    void loadAlerts()
  }, [])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Central do atendente
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Notificacoes do sistema
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Registre alertas e confira notificacoes retornadas pelo backend.
            </p>
          </div>
          <Button variant="secondary" onClick={() => void loadAlerts()}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border bg-white px-5 py-4">
            <BellRing className="size-5 text-brand-orange" />
            <div>
              <p className="text-2xl font-bold text-brand-navy">
                {openAlerts}
              </p>
              <p className="text-xs text-slate-500">alertas abertos</p>
            </div>
          </div>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
            {message}
          </p>
        )}

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border bg-white p-6"
          >
            <h2 className="text-lg font-bold text-brand-navy">
              Informar novo problema
            </h2>
            <div className="mt-5 space-y-4">
              <Input
                id="alert-title"
                label="Titulo do alerta"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: erro ao finalizar pedido"
              />
              <label htmlFor="alert-description" className="block">
                <span className="mb-2 block text-sm font-medium text-brand-navy">
                  Descricao
                </span>
                <textarea
                  id="alert-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Descreva o que aconteceu e onde o atendente deve conferir."
                  className="min-h-32 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {saving ? 'Enviando...' : 'Enviar ao atendente'}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {loading ? (
              <div className="grid min-h-72 place-items-center rounded-2xl border bg-white">
                <LoaderCircle className="size-9 animate-spin text-brand-orange" />
              </div>
            ) : alerts.length ? (
              alerts.map((alert) => (
                <article key={alert.id} className="rounded-2xl border bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      {alert.severity === 'Resolvido' ? (
                        <CheckCircle2 className="mt-1 size-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="mt-1 size-5 text-brand-orange" />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-brand-navy">
                            {alert.title || 'Notificacao sem titulo'}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {alert.description}
                        </p>
                        {alert.createdAt && (
                          <p className="mt-3 text-xs text-slate-400">
                            {alert.createdAt}
                          </p>
                        )}
                      </div>
                    </div>
                    {alert.severity !== 'Resolvido' && (
                      <Button
                        variant="secondary"
                        onClick={() => void resolveAlert(alert.id)}
                      >
                        Resolver
                      </Button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed bg-white p-14 text-center text-sm text-slate-500">
                Nenhuma notificacao retornada pelo backend.
              </div>
            )}
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
