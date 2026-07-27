import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Headphones,
  Inbox,
  LoaderCircle,
  MessageCircleMore,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  UsersRound,
  Wifi,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../lib/api-error'
import { cn } from '../lib/cn'
import {
  whatsappService,
  type ChatStatus,
  type WhatsappSession,
} from '../services/whatsapp-service'

type QueueFilter = 'ALL' | ChatStatus

const attendantNumber =
  import.meta.env.VITE_WHATSAPP_ATTENDANT_NUMBER ?? '553484114981'

const demoSessions: WhatsappSession[] = [
  {
    whatsappId: '5511987654321',
    status: 'PENDING',
    currentState: 'ATENDIMENTO_HUMANO',
    humanAssigned: true,
    resolvedBy: 'HUMANO',
    humanAssignedAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    attendanceSubject: 'Manutenção em máquina',
    lastMessage:
      'Minha impressora parou de extrusar filamentos, já tentei trocar o nozzle e nada resolveu.',
  },
  {
    whatsappId: '5511976543210',
    status: 'PENDING',
    currentState: 'ATENDIMENTO_HUMANO',
    humanAssigned: true,
    resolvedBy: 'HUMANO',
    humanAssignedAt: new Date(Date.now() - 7 * 60_000).toISOString(),
    attendanceSubject: 'Compra em atacado acima de 30 kg',
    lastMessage:
      'Bom dia, gostaria de um orçamento para 50 kg de PLA preto e 30 kg de ABS branco.',
  },
  {
    whatsappId: '5511965432109',
    status: 'IN_PROGRESS',
    currentState: 'ATENDIMENTO_HUMANO',
    humanAssigned: true,
    resolvedBy: 'HUMANO',
    humanAssignedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    assignedTo: attendantNumber,
    attendanceSubject: 'Dúvida sobre catálogo',
    lastMessage:
      'Vocês têm a Ender 3 V3 em estoque? E qual é o prazo de entrega para São Paulo?',
  },
  {
    whatsappId: '5511954321098',
    status: 'RESOLVED',
    currentState: 'MENU_PRINCIPAL',
    humanAssigned: false,
    resolvedBy: 'BOT',
    humanAssignedAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    attendanceSubject: 'Mentoria de impressão 3D',
    lastMessage:
      'Quero saber mais sobre a mentoria de impressão 3D, qual a grade e o valor?',
  },
]

const statusDetails: Record<
  ChatStatus,
  { label: string; dot: string; badge: string }
> = {
  PENDING: {
    label: 'Aguardando',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  IN_PROGRESS: {
    label: 'Em atendimento',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  RESOLVED: {
    label: 'Finalizado',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
}

function formatPhone(number: string) {
  const clean = number.replace(/\D/g, '')

  if (clean.length === 13) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`
  }

  if (clean.length === 12) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`
  }

  return number
}

function getInitials(number: string) {
  const clean = number.replace(/\D/g, '')
  return clean.slice(-2) || 'WA'
}

function getWaitingTime(date?: string) {
  if (!date) return 'Agora'

  const timestamp = new Date(date).getTime()
  if (Number.isNaN(timestamp)) return 'Agora'

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  return hours < 24
    ? `${hours}h ${minutes % 60}min`
    : `${Math.floor(hours / 24)}d`
}

function formatState(state?: string) {
  if (!state) return 'Não informado'

  return state
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDateTime(date?: string) {
  if (!date) return 'Não informado'

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return 'Não informado'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value)
}

function StatusBadge({ status }: { status: ChatStatus }) {
  const detail = statusDetails[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
        detail.badge,
      )}
    >
      <span className={cn('size-1.5 rounded-full', detail.dot)} />
      {detail.label}
    </span>
  )
}

function ActorBadge({ actor }: { actor: WhatsappSession['resolvedBy'] }) {
  if (actor === 'HUMANO') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700 ring-1 ring-violet-200 ring-inset">
        <UserRound className="size-3" />
        Humano
      </span>
    )
  }

  if (actor === 'BOT') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700 ring-1 ring-cyan-200 ring-inset">
        <Bot className="size-3" />
        Bot
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200 ring-inset">
      Não definido
    </span>
  )
}

function QueueSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex animate-pulse gap-3 rounded-2xl p-3">
          <div className="size-11 shrink-0 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-2/5 rounded bg-slate-200" />
            <div className="h-3 w-4/5 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function WhatsappAdminPage() {
  const [sessions, setSessions] = useState<WhatsappSession[]>([])
  const [selectedNumber, setSelectedNumber] = useState('')
  const [filter, setFilter] = useState<QueueFilter>('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [action, setAction] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  const loadQueue = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)

    try {
      const queue = await whatsappService.getQueue()
      setSessions(queue)
      setSelectedNumber((current) =>
        current && queue.some((item) => item.whatsappId === current)
          ? current
          : window.matchMedia('(min-width: 1024px)').matches
            ? (queue[0]?.whatsappId ?? '')
            : '',
      )
      setError('')
      setDemoMode(false)
    } catch (loadError) {
      if (import.meta.env.DEV) {
        setSessions((current) => (current.length ? current : demoSessions))
        setDemoMode(true)
        setSelectedNumber((current) =>
          current || window.matchMedia('(min-width: 1024px)').matches
            ? current || demoSessions[0].whatsappId
            : '',
        )
        setError(
          `${getApiErrorMessage(loadError, 'Backend Java indisponível.')} Exibindo dados demonstrativos para você testar a tela.`,
        )
      } else {
        setError(
          getApiErrorMessage(
            loadError,
            'Não foi possível carregar a fila do WhatsApp.',
          ),
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadQueue()
    const interval = window.setInterval(() => void loadQueue(true), 15_000)
    return () => window.clearInterval(interval)
  }, [loadQueue])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const counts = useMemo(
    () => ({
      PENDING: sessions.filter((item) => item.status === 'PENDING').length,
      IN_PROGRESS: sessions.filter((item) => item.status === 'IN_PROGRESS')
        .length,
      RESOLVED: sessions.filter((item) => item.status === 'RESOLVED').length,
    }),
    [sessions],
  )

  const visibleSessions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return sessions.filter((item) => {
      const matchesFilter = filter === 'ALL' || item.status === filter
      const matchesSearch =
        !query ||
        item.whatsappId.toLowerCase().includes(query) ||
        item.resolvedBy.toLowerCase().includes(query) ||
        item.attendanceSubject?.toLowerCase().includes(query) ||
        item.lastMessage?.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [filter, search, sessions])

  const selected = sessions.find((item) => item.whatsappId === selectedNumber)

  async function handleAssign(session: WhatsappSession) {
    setAction(`assign:${session.whatsappId}`)
    setNotice('')

    try {
      if (demoMode) {
        setSessions((current) =>
          current.map((item) =>
            item.whatsappId === session.whatsappId
              ? {
                  ...item,
                  status: 'IN_PROGRESS',
                  assignedTo: attendantNumber,
                  resolvedBy: 'HUMANO',
                }
              : item,
          ),
        )
        setError('')
        setNotice('Atendimento demonstrativo assumido com sucesso.')
        return
      }

      await whatsappService.assign(session.whatsappId, attendantNumber)
      setNotice('Atendimento assumido com sucesso.')
      await loadQueue(true)
    } catch (assignError) {
      setError(
        getApiErrorMessage(assignError, 'Não foi possível assumir a conversa.'),
      )
    } finally {
      setAction('')
    }
  }

  async function handleRelease(session: WhatsappSession) {
    setAction(`release:${session.whatsappId}`)
    setNotice('')

    try {
      if (demoMode) {
        setSessions((current) =>
          current.map((item) =>
            item.whatsappId === session.whatsappId
              ? {
                  ...item,
                  status: 'RESOLVED',
                  currentState: 'MENU_PRINCIPAL',
                  humanAssigned: false,
                  assignedTo: undefined,
                  resolvedBy: 'HUMANO',
                }
              : item,
          ),
        )
        setError('')
        setNotice(
          'Atendimento demonstrativo finalizado. O bot voltou a responder.',
        )
        return
      }

      await whatsappService.release(session.whatsappId)
      setNotice('Atendimento finalizado. O bot voltou a responder ao cliente.')
      await loadQueue(true)
    } catch (releaseError) {
      setError(
        getApiErrorMessage(
          releaseError,
          'Não foi possível finalizar o atendimento.',
        ),
      )
    } finally {
      setAction('')
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-full bg-[#f4f6fa] p-4 sm:p-6 xl:p-8">
        <div className="mx-auto max-w-[1500px]">
          <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-brand-orange flex items-center gap-2 text-sm font-bold">
                <span className="grid size-7 place-items-center rounded-lg bg-orange-100">
                  <MessageCircleMore className="size-4" />
                </span>
                Central de relacionamento
              </div>
              <h1 className="text-brand-navy mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Atendimento WhatsApp
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Acompanhe solicitações, veja a última mensagem e organize a fila
                de atendimento humano em um só lugar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold',
                  error
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                )}
              >
                <span className="relative flex size-2">
                  {!error && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={cn(
                      'relative inline-flex size-2 rounded-full',
                      error ? 'bg-amber-500' : 'bg-emerald-500',
                    )}
                  />
                </span>
                {error ? 'Backend desconectado' : 'Monitoramento ativo'}
              </span>
              <Button
                variant="secondary"
                onClick={() => void loadQueue(true)}
                disabled={refreshing}
              >
                <RefreshCw
                  className={cn('size-4', refreshing && 'animate-spin')}
                />
                Atualizar fila
              </Button>
            </div>
          </header>

          {(error || notice) && (
            <div
              className={cn(
                'mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm',
                error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700',
              )}
            >
              {error ? (
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              )}
              <span className="flex-1 font-medium">{error || notice}</span>
              <button
                type="button"
                aria-label="Fechar aviso"
                onClick={() => {
                  setError('')
                  setNotice('')
                }}
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => setFilter('PENDING')}
              className={cn(
                'group flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                filter === 'PENDING' &&
                  'border-amber-300 ring-2 ring-amber-100',
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="size-5" />
              </span>
              <span>
                <strong className="text-brand-navy block text-2xl font-bold">
                  {counts.PENDING}
                </strong>
                <span className="text-xs font-semibold text-slate-500">
                  Aguardando atendimento
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('IN_PROGRESS')}
              className={cn(
                'group flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                filter === 'IN_PROGRESS' &&
                  'border-emerald-300 ring-2 ring-emerald-100',
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Headphones className="size-5" />
              </span>
              <span>
                <strong className="text-brand-navy block text-2xl font-bold">
                  {counts.IN_PROGRESS}
                </strong>
                <span className="text-xs font-semibold text-slate-500">
                  Em atendimento agora
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('RESOLVED')}
              className={cn(
                'group flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                filter === 'RESOLVED' &&
                  'border-slate-300 ring-2 ring-slate-100',
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <CheckCircle2 className="size-5" />
              </span>
              <span>
                <strong className="text-brand-navy block text-2xl font-bold">
                  {counts.RESOLVED}
                </strong>
                <span className="text-xs font-semibold text-slate-500">
                  Atendimentos finalizados
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={cn(
                'group flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                filter === 'ALL' && 'border-blue-300 ring-2 ring-blue-100',
              )}
            >
              <span className="text-brand-navy grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50">
                <UsersRound className="size-5" />
              </span>
              <span>
                <strong className="text-brand-navy block text-2xl font-bold">
                  {sessions.length}
                </strong>
                <span className="text-xs font-semibold text-slate-500">
                  Conversas na fila
                </span>
              </span>
            </button>
          </section>

          <section className="mt-5 grid min-h-[590px] overflow-hidden rounded-3xl border bg-white shadow-[0_20px_55px_rgba(6,29,79,0.08)] lg:h-[calc(100vh-390px)] lg:min-h-[580px] lg:grid-cols-[390px_minmax(0,1fr)]">
            <aside
              className={cn(
                'flex min-h-[520px] flex-col border-r',
                selected && 'hidden lg:flex',
              )}
            >
              <div className="border-b p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-brand-navy font-bold">Conversas</h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Atualização automática a cada 15s
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Todas as conversas"
                    onClick={() => setFilter('ALL')}
                    className="grid size-9 place-items-center rounded-xl border text-slate-500 transition hover:bg-slate-50"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>

                <label className="relative mt-4 block">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar número, assunto ou mensagem"
                    className="h-11 w-full rounded-xl border bg-slate-50 pr-9 pl-9 text-sm transition outline-none focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Limpar busca"
                      onClick={() => setSearch('')}
                      className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-200"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </label>

                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                  {(
                    [
                      ['ALL', 'Todas'],
                      ['PENDING', 'Aguardando'],
                      ['IN_PROGRESS', 'Em atendimento'],
                      ['RESOLVED', 'Finalizados'],
                    ] as [QueueFilter, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition',
                        filter === value
                          ? 'bg-brand-navy text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loading ? (
                  <QueueSkeleton />
                ) : visibleSessions.length ? (
                  <div className="p-2">
                    {visibleSessions.map((session) => (
                      <button
                        key={session.whatsappId}
                        type="button"
                        onClick={() => setSelectedNumber(session.whatsappId)}
                        className={cn(
                          'group flex w-full items-start gap-3 rounded-2xl p-3 text-left transition',
                          selectedNumber === session.whatsappId
                            ? 'bg-blue-50 ring-1 ring-blue-100'
                            : 'hover:bg-slate-50',
                        )}
                      >
                        <span className="bg-brand-navy relative grid size-11 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-sm">
                          {getInitials(session.whatsappId)}
                          <span
                            className={cn(
                              'absolute right-0 bottom-0 size-3 rounded-full border-2 border-white',
                              statusDetails[session.status].dot,
                            )}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <strong className="text-brand-navy truncate text-sm">
                              {formatPhone(session.whatsappId)}
                            </strong>
                            <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                              {getWaitingTime(session.humanAssignedAt)}
                            </span>
                          </span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <StatusBadge status={session.status} />
                            <ActorBadge actor={session.resolvedBy} />
                          </span>
                          <span className="mt-1.5 block truncate text-xs font-semibold text-slate-500">
                            <span className="mr-1 text-slate-300">#</span>
                            {session.attendanceSubject || 'Atendimento geral'}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-400">
                            {session.lastMessage || 'Sem mensagem disponível'}
                          </span>
                        </span>
                        <ChevronRight className="group-hover:text-brand-orange mt-3 size-4 shrink-0 text-slate-300" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid h-full min-h-64 place-items-center p-8 text-center">
                    <div>
                      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <Inbox className="size-6" />
                      </span>
                      <p className="text-brand-navy mt-4 font-bold">
                        Nenhuma conversa encontrada
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Ajuste os filtros ou aguarde uma nova solicitação.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <div
              className={cn(
                'min-w-0 bg-slate-50/60',
                !selected && 'hidden lg:block',
              )}
            >
              {selected ? (
                <div className="flex h-full min-h-[580px] flex-col">
                  <div className="flex items-center gap-3 border-b bg-white px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      aria-label="Voltar para conversas"
                      onClick={() => setSelectedNumber('')}
                      className="grid size-10 shrink-0 place-items-center rounded-xl border text-slate-500 lg:hidden"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <span className="bg-brand-navy grid size-11 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
                      {getInitials(selected.whatsappId)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-brand-navy truncate font-bold sm:text-lg">
                          {formatPhone(selected.whatsappId)}
                        </h2>
                        <StatusBadge status={selected.status} />
                        <ActorBadge actor={selected.resolvedBy} />
                      </div>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <Wifi className="size-3" /> Canal WhatsApp
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/${selected.whatsappId.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-navy inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-xs font-bold transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <ExternalLink className="size-4" />
                      <span className="hidden sm:inline">Abrir WhatsApp</span>
                    </a>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-3xl">
                      <div className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                        <span className="h-px flex-1 bg-slate-200" />
                        Última mensagem recebida
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="mt-8 flex items-end gap-3">
                        <span className="bg-brand-navy grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white">
                          {getInitials(selected.whatsappId)}
                        </span>
                        <div className="max-w-[85%] rounded-2xl rounded-bl-md border bg-white px-4 py-3 shadow-sm sm:max-w-[75%]">
                          <p className="text-sm leading-6 whitespace-pre-wrap text-slate-700">
                            {selected.lastMessage ||
                              'A mensagem mais recente ainda não está disponível.'}
                          </p>
                          <p className="mt-2 flex items-center justify-end gap-1 text-[10px] font-semibold text-slate-400">
                            <Clock3 className="size-3" />
                            {getWaitingTime(selected.humanAssignedAt) ===
                            'Agora'
                              ? 'agora'
                              : `${getWaitingTime(selected.humanAssignedAt)} atrás`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                            Tipo de solicitação
                          </p>
                          <p className="text-brand-navy mt-2 font-bold">
                            {selected.attendanceSubject || 'Atendimento geral'}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'rounded-2xl border p-4 shadow-sm',
                            selected.resolvedBy === 'HUMANO'
                              ? 'border-violet-100 bg-violet-50/70'
                              : selected.resolvedBy === 'BOT'
                                ? 'border-cyan-100 bg-cyan-50/70'
                                : 'bg-white',
                          )}
                        >
                          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                            Conduzido por
                          </p>
                          <div className="mt-2">
                            <ActorBadge actor={selected.resolvedBy} />
                          </div>
                        </div>
                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                            Responsável
                          </p>
                          <p className="text-brand-navy mt-2 flex items-center gap-2 font-bold">
                            <UserRoundCheck className="text-brand-orange size-4" />
                            {selected.assignedTo
                              ? formatPhone(selected.assignedTo)
                              : 'Ainda não atribuído'}
                          </p>
                        </div>
                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                            Etapa da conversa
                          </p>
                          <p className="text-brand-navy mt-2 font-bold">
                            {formatState(selected.currentState)}
                          </p>
                        </div>
                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                            Entrada na fila
                          </p>
                          <p className="text-brand-navy mt-2 font-bold">
                            {formatDateTime(selected.humanAssignedAt)}
                          </p>
                        </div>
                        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:col-span-2">
                          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                            Identificação do cliente
                          </p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-brand-navy font-bold">
                              {formatPhone(selected.whatsappId)}
                            </p>
                            <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">
                              {selected.whatsappId}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'mt-4 rounded-2xl border p-4 sm:flex sm:items-center sm:justify-between sm:gap-4',
                          selected.resolvedBy === 'HUMANO'
                            ? 'border-violet-100 bg-violet-50/70'
                            : selected.resolvedBy === 'BOT'
                              ? 'border-cyan-100 bg-cyan-50/70'
                              : 'border-blue-100 bg-blue-50/70',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {selected.resolvedBy === 'BOT' ? (
                            <Bot className="mt-0.5 size-5 shrink-0 text-cyan-700" />
                          ) : selected.resolvedBy === 'HUMANO' ? (
                            <UserRoundCheck className="mt-0.5 size-5 shrink-0 text-violet-700" />
                          ) : (
                            <ShieldCheck className="text-brand-navy mt-0.5 size-5 shrink-0" />
                          )}
                          <div>
                            <p className="text-brand-navy text-sm font-bold">
                              {selected.resolvedBy === 'BOT'
                                ? 'Conversa conduzida pelo assistente automático'
                                : selected.resolvedBy === 'HUMANO'
                                  ? 'Atendimento humano protegido'
                                  : 'Origem do atendimento não identificada'}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {selected.resolvedBy === 'BOT'
                                ? 'O cliente recebeu orientação automática sem precisar entrar na fila de um atendente.'
                                : selected.resolvedBy === 'HUMANO'
                                  ? 'Enquanto esta conversa estiver ativa, o bot não interfere nas respostas do atendente.'
                                  : 'Assim que o backend informar resolvedBy, a origem aparecerá com sua cor correspondente.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer className="border-t bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                    <p className="mb-3 text-xs leading-5 text-slate-400 sm:mb-0">
                      Responda pelo WhatsApp e gerencie o estado da conversa
                      aqui.
                    </p>
                    <div className="flex gap-2">
                      {selected.status === 'PENDING' ? (
                        <Button
                          className="flex-1 sm:flex-none"
                          onClick={() => void handleAssign(selected)}
                          disabled={Boolean(action)}
                        >
                          {action === `assign:${selected.whatsappId}` ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Headphones className="size-4" />
                          )}
                          Assumir atendimento
                        </Button>
                      ) : selected.status === 'IN_PROGRESS' ? (
                        <Button
                          variant="secondary"
                          className="flex-1 border-emerald-200 text-emerald-700 sm:flex-none"
                          onClick={() => void handleRelease(selected)}
                          disabled={Boolean(action)}
                        >
                          {action === `release:${selected.whatsappId}` ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          Finalizar atendimento
                        </Button>
                      ) : (
                        <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-500 sm:flex-none">
                          <CheckCircle2 className="size-4" />
                          Atendimento finalizado
                        </span>
                      )}
                    </div>
                  </footer>
                </div>
              ) : (
                <div className="grid h-full min-h-[580px] place-items-center p-8 text-center">
                  <div className="max-w-sm">
                    <span className="text-brand-navy mx-auto grid size-16 place-items-center rounded-3xl bg-blue-50">
                      <MessageCircleMore className="size-8" />
                    </span>
                    <h2 className="text-brand-navy mt-5 text-xl font-bold">
                      Selecione uma conversa
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Escolha um cliente na fila para visualizar a mensagem e
                      gerenciar o atendimento.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
