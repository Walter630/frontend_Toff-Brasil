import { api } from '../lib/api'

export type IntegrationStatus = {
  name: string
  connected: boolean
  description?: string
}

export const integrationService = {
  async list() {
    const { data } = await api.get('/integracoes')
    const integrations = Array.isArray(data)
      ? data
      : data && typeof data === 'object'
        ? (data as Record<string, unknown>).integrations ??
          (data as Record<string, unknown>).integracoes ??
          (data as Record<string, unknown>).data
        : []

    return Array.isArray(integrations)
      ? integrations.map((integration) => {
          const item = integration as Record<string, unknown>

          return {
            name: String(item.name ?? item.nome ?? ''),
            connected: Boolean(item.connected ?? item.conectado ?? false),
            description: String(item.description ?? item.descricao ?? ''),
          }
        })
      : []
  },

  async connect(name: string) {
    const { data } = await api.post(
      `/integracoes/${encodeURIComponent(name)}/conectar`,
    )

    return data as { url?: string }
  },
}
