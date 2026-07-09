import {
  Box,
  CheckCircle2,
  LoaderCircle,
  Megaphone,
  PlugZap,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../lib/api-error'
import {
  integrationService,
  type IntegrationStatus,
} from '../services/integration-service'

const defaultIntegrations = [
  {
    name: 'Shopee',
    description: 'Sincronizacao de produtos, estoque e pedidos.',
    icon: ShoppingBag,
  },
  {
    name: 'Amazon',
    description: 'Catalogo, ofertas, estoque e pedidos do marketplace.',
    icon: Box,
  },
  {
    name: 'Meta',
    description: 'Catalogo Facebook / Instagram e anuncios de produtos.',
    icon: Megaphone,
  },
]

export function IntegrationsPage() {
  const [statuses, setStatuses] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingName, setConnectingName] = useState('')
  const [message, setMessage] = useState('')

  const integrations = useMemo(
    () =>
      defaultIntegrations.map((integration) => {
        const status = statuses.find(
          (item) =>
            item.name.toLowerCase() === integration.name.toLowerCase(),
        )

        return {
          ...integration,
          connected: status?.connected ?? false,
          description: status?.description || integration.description,
        }
      }),
    [statuses],
  )

  async function loadIntegrations() {
    setLoading(true)
    setMessage('')

    try {
      setStatuses(await integrationService.list())
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel carregar integracoes.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(name: string) {
    setConnectingName(name)
    setMessage('')

    try {
      const response = await integrationService.connect(name)

      if (response.url) {
        window.location.href = response.url
        return
      }

      setMessage(`Integracao ${name} solicitada ao backend.`)
      await loadIntegrations()
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel iniciar integracao.'))
    } finally {
      setConnectingName('')
    }
  }

  useEffect(() => {
    void loadIntegrations()
  }, [])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Backend OAuth
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Integracoes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Status e inicio de conexao controlados pelas rotas do backend.
            </p>
          </div>
          <Button variant="secondary" onClick={() => void loadIntegrations()}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-72 place-items-center rounded-2xl border bg-white">
            <LoaderCircle className="size-9 animate-spin text-brand-orange" />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {integrations.map(({ name, description, icon: Icon, connected }) => (
              <article key={name} className="rounded-2xl border bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                    <Icon className="size-6" />
                  </div>
                  <span
                    className={
                      connected
                        ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'
                        : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500'
                    }
                  >
                    {connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <h2 className="mt-6 text-lg font-bold text-brand-navy">
                  {name}
                </h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {description}
                </p>
                <Button
                  className="mt-6 w-full"
                  variant={connected ? 'secondary' : 'primary'}
                  onClick={() => void handleConnect(name)}
                  disabled={connectingName === name}
                >
                  {connectingName === name ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : connected ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <PlugZap className="size-4" />
                  )}
                  {connectingName === name
                    ? 'Conectando...'
                    : connected
                      ? 'Reconectar'
                      : 'Conectar'}
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
