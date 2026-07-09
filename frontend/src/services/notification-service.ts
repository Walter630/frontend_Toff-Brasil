import { api } from '../lib/api'

export type ManagerAlert = {
  id: string
  title: string
  description: string
  severity: 'Critico' | 'Atencao' | 'Resolvido'
  createdAt: string
}

type RawAlert = Record<string, unknown>

function normalizeAlert(data: unknown): ManagerAlert {
  const alert = (data && typeof data === 'object' ? data : {}) as RawAlert

  return {
    id: String(alert.id ?? crypto.randomUUID()),
    title: String(alert.title ?? alert.titulo ?? ''),
    description: String(alert.description ?? alert.descricao ?? ''),
    severity: String(
      alert.severity ?? alert.severidade ?? 'Atencao',
    ) as ManagerAlert['severity'],
    createdAt: String(alert.createdAt ?? alert.criadoEm ?? ''),
  }
}

function normalizeAlertsResponse(data: unknown) {
  if (Array.isArray(data)) {
    return data.map(normalizeAlert)
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  const response = data as Record<string, unknown>
  const alerts =
    response.alerts ?? response.notificacoes ?? response.content ?? response.data

  return Array.isArray(alerts) ? alerts.map(normalizeAlert) : []
}

export const notificationService = {
  async list() {
    const { data } = await api.get('/notificacoes')
    return normalizeAlertsResponse(data)
  },

  async create(payload: Pick<ManagerAlert, 'title' | 'description'>) {
    const { data } = await api.post('/notificacoes', payload)
    return normalizeAlert(data)
  },

  async resolve(id: string) {
    const { data } = await api.patch(`/notificacoes/${encodeURIComponent(id)}`, {
      severity: 'Resolvido',
    })

    return normalizeAlert(data)
  },
}
