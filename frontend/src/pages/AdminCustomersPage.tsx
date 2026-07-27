import {
  ArrowLeft,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { getApiErrorMessage } from '../lib/api-error'
import {
  adminService,
  type AdminCustomer,
} from '../services/admin-service'

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatDate(value?: string) {
  if (!value) return 'Atividade não informada'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? 'Atividade não informada'
    : dateTime.format(parsed)
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setCustomers(await adminService.getCustomers())
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Não foi possível carregar os clientes agora.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCustomers()
  }, [loadCustomers])

  const visibleCustomers = useMemo(() => {
    const term = normalize(search.trim())
    if (!term) return customers

    return customers.filter((customer) =>
      normalize(
        `${customer.name} ${customer.email} ${customer.phone} ${customer.role ?? ''}`,
      ).includes(term),
    )
  }, [customers, search])

  return (
    <DashboardLayout>
      <main className="container-store py-6 sm:py-9">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-brand-orange"
        >
          <ArrowLeft className="size-4" />
          Voltar ao painel
        </Link>

        <header className="mt-5 overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,.08)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] text-brand-orange uppercase">
                Relacionamento
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Clientes
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Consulte nome, e-mail e telefone das contas e das pessoas com
                atividade registrada na loja.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-orange-50 text-brand-orange">
                <UsersRound className="size-6" />
              </span>
              <div>
                <strong className="block text-2xl font-black text-slate-950">
                  {loading ? '—' : customers.length}
                </strong>
                <span className="text-xs text-slate-400">cliente(s) visíveis</span>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 overflow-hidden rounded-[1.6rem] border border-black/[0.05] bg-white shadow-[0_16px_45px_rgba(15,23,42,.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <label className="relative block w-full sm:max-w-md">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-4 pl-10 text-sm outline-none transition focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadCustomers()}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-orange-200 hover:text-brand-orange disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {error ? (
            <p className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          ) : loading ? (
            <div className="grid min-h-64 place-items-center text-slate-400">
              <LoaderCircle className="size-8 animate-spin text-brand-orange" />
            </div>
          ) : visibleCustomers.length ? (
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
              {visibleCustomers.map((customer) => {
                const phoneNumber = customer.phone.replace(/\D/g, '')

                return (
                  <article
                    key={`${customer.id}-${customer.email}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-orange-200 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand-orange shadow-sm ring-1 ring-slate-100">
                        <UserRound className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-extrabold text-slate-800">
                          {customer.name}
                        </h2>
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                          {customer.role || 'Cliente'} · {formatDate(customer.lastActivity)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-100 hover:text-brand-orange"
                      >
                        <Mail className="size-4 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </a>
                      {phoneNumber ? (
                        <a
                          href={`https://wa.me/${phoneNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          <Phone className="size-4" />
                          {customer.phone}
                        </a>
                      ) : (
                        <p className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-400 ring-1 ring-slate-100">
                          <Phone className="size-4" />
                          Telefone não informado
                        </p>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center p-6 text-center">
              <div>
                <UsersRound className="mx-auto size-10 text-slate-300" />
                <p className="mt-3 font-bold text-slate-700">
                  Nenhum cliente encontrado
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Ajuste a busca ou atualize os dados.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  )
}
