import { api } from '../lib/api'

export type ChatStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
export type ResolutionActor = 'BOT' | 'HUMANO' | 'UNKNOWN'

export type WhatsappSession = {
  whatsappId: string
  status: ChatStatus
  currentState?: string
  humanAssigned: boolean
  humanAssignedAt?: string
  assignedTo?: string
  attendanceSubject?: string
  lastMessage?: string
  resolvedBy: ResolutionActor
}

function normalizeStatus(value: unknown): ChatStatus {
  const status = String(value ?? '').toUpperCase()

  if (status === 'IN_PROGRESS' || status === 'RESOLVED') {
    return status
  }

  return 'PENDING'
}

function normalizeResolutionActor(value: unknown): ResolutionActor {
  const actor = String(value ?? '')
    .trim()
    .toUpperCase()

  if (['HUMANO', 'HUMAN', 'ATENDENTE'].includes(actor)) return 'HUMANO'
  if (['BOT', 'CHATBOT', 'AUTOMATICO', 'AUTOMÁTICO'].includes(actor))
    return 'BOT'

  return 'UNKNOWN'
}

function normalizeSession(value: unknown): WhatsappSession {
  const item = (value ?? {}) as Record<string, unknown>

  return {
    whatsappId: String(
      item.whatsappId ?? item.clientNumber ?? item.number ?? '',
    ),
    status: normalizeStatus(item.status),
    currentState: item.currentState ? String(item.currentState) : undefined,
    humanAssigned: Boolean(item.humanAssigned),
    // O backend atual usa "humanAssingnedAt" (com o typo). Aceitamos os dois.
    humanAssignedAt: item.humanAssignedAt
      ? String(item.humanAssignedAt)
      : item.humanAssingnedAt
        ? String(item.humanAssingnedAt)
        : undefined,
    assignedTo: item.assignedTo ? String(item.assignedTo) : undefined,
    attendanceSubject: item.attendanceSubject
      ? String(item.attendanceSubject)
      : undefined,
    lastMessage: item.lastMessage ? String(item.lastMessage) : undefined,
    resolvedBy: normalizeResolutionActor(
      item.resolvedBy ?? item.resolvidoPor ?? item.attendedBy,
    ),
  }
}

export const whatsappService = {
  async getQueue() {
    const { data } = await api.get('/webhook/whatsapp/queue')
    const queue = Array.isArray(data)
      ? data
      : data && typeof data === 'object'
        ? ((data as Record<string, unknown>).queue ??
          (data as Record<string, unknown>).data)
        : []

    return Array.isArray(queue) ? queue.map(normalizeSession) : []
  },

  async assign(clientNumber: string, attendantNumber: string) {
    await api.post(
      `/webhook/whatsapp/queue/${encodeURIComponent(clientNumber)}/assign`,
      undefined,
      { params: { attendantNumber } },
    )
  },

  async release(clientNumber: string) {
    await api.post(
      `/webhook/whatsapp/queue/${encodeURIComponent(clientNumber)}/release`,
    )
  },
}
