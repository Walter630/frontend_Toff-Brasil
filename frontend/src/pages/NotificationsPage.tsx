import type { FormEvent } from 'react'

import { AlertTriangle, BellRing, CheckCircle2, Send } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

type ManagerAlert = {
  id: string
  title: string
  description: string
  severity: 'Crítico' | 'Atenção' | 'Resolvido'
  createdAt: string
}

const initialAlerts: ManagerAlert[] = [
  {
    id: 'api-produtos',
    title: 'Falha ao carregar produtos',
    description:
      'Quando a API de produtos ficar indisponível, o gerente deve conferir o backend antes de abrir o atendimento.',
    severity: 'Crítico',
    createdAt: 'Monitoramento automático',
  },
  {
    id: 'estoque-baixo',
    title: 'Produtos com estoque baixo',
    description:
      'Itens com poucas unidades precisam de revisão antes de confirmar novos pedidos presenciais.',
    severity: 'Atenção',
    createdAt: 'Regra de operação',
  },
]

function getStoredAlerts() {
  const stored = localStorage.getItem('toffbr:manager-alerts')

  if (!stored) {
    return initialAlerts
  }

  try {
    return JSON.parse(stored) as ManagerAlert[]
  } catch {
    return initialAlerts
  }
}

export function NotificationsPage() {
  const [alerts, setAlerts] = useState<ManagerAlert[]>(getStoredAlerts)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const openAlerts = useMemo(
    () => alerts.filter((alert) => alert.severity !== 'Resolvido').length,
    [alerts],
  )

  const saveAlerts = (nextAlerts: ManagerAlert[]) => {
    setAlerts(nextAlerts)
    localStorage.setItem('toffbr:manager-alerts', JSON.stringify(nextAlerts))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !description.trim()) {
      return
    }

    saveAlerts([
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        severity: 'Atenção',
        createdAt: new Date().toLocaleString('pt-BR'),
      },
      ...alerts,
    ])
    setTitle('')
    setDescription('')
  }

  const resolveAlert = (id: string) => {
    saveAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, severity: 'Resolvido' } : alert,
      ),
    )
  }

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Central do gerente
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Notificações do sistema
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Área para registrar erros, alertas operacionais e pendências que
              precisam chegar ao gerente.
            </p>
          </div>
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
                label="Título do alerta"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: erro ao finalizar pedido"
              />
              <label htmlFor="alert-description" className="block">
                <span className="mb-2 block text-sm font-medium text-brand-navy">
                  Descrição
                </span>
                <textarea
                  id="alert-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Descreva o que aconteceu e onde o gerente deve conferir."
                  className="min-h-32 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <Button type="submit" className="w-full">
                <Send className="size-4" />
                Enviar ao gerente
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {alerts.map((alert) => (
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
                          {alert.title}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {alert.description}
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        {alert.createdAt}
                      </p>
                    </div>
                  </div>
                  {alert.severity !== 'Resolvido' && (
                    <Button
                      variant="secondary"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </DashboardLayout>
  )
}
