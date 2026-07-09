import type { ReactNode } from 'react'

import {
  BadgePercent,
  BellRing,
  ClipboardList,
  Heart,
  Home,
  LogOut,
  Menu,
  Package,
  PackagePlus,
  PlugZap,
  Settings,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { cn } from '../../lib/cn'
import { authService } from '../../services/auth-service'
import { Footer } from './Footer'

type DashboardLayoutProps = {
  children: ReactNode
}

const navigation = [
  { label: 'Inicio', icon: Home, to: '/dashboard' },
  { label: 'Catalogo', icon: Package, to: '/catalogo' },
  { label: 'Carrinho', icon: ShoppingCart, to: '/carrinho' },
  { label: 'Favoritos', icon: Heart, to: '/favoritos' },
  { label: 'Pedidos', icon: ShoppingBag, to: '/pedidos' },
]

const operatorNavigation = [
  { label: 'Atendimento', icon: ClipboardList, to: '/pedido-presencial' },
]

const managerNavigation = [
  { label: 'Cupons', icon: BadgePercent, to: '/cupons' },
  { label: 'Notificacoes', icon: BellRing, to: '/notificacoes' },
  { label: 'Integracoes', icon: PlugZap, to: '/integracoes' },
]

const adminNavigation = [
  { label: 'Admin produtos', icon: PackagePlus, to: '/admin' },
]

const mobileNavigation = [
  { label: 'Inicio', icon: Home, to: '/dashboard' },
  { label: 'Catalogo', icon: Package, to: '/catalogo' },
  { label: 'Carrinho', icon: ShoppingCart, to: '/carrinho' },
  { label: 'Pedidos', icon: ShoppingBag, to: '/pedidos' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const isAuthenticated = authService.isAuthenticated()
  const canUseOperatorRoutes =
    import.meta.env.DEV || authService.canOperateStore()
  const canUseManagerRoutes = import.meta.env.DEV || authService.canManageStore()

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    authService.clearSession()
    closeMenu()
    navigate('/dashboard')
  }

  const sidebar = (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <img
          src="/brand/logo-toffbr.jpeg"
          alt="Toff Brasil"
          className="size-11 rounded-xl bg-white object-contain p-1"
        />
        <div>
          <p className="font-bold text-white">Toff Brasil</p>
          <p className="text-xs text-blue-200/60">Catalogo 3D</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/40">
          Menu principal
        </p>
        <div className="space-y-1">
          {navigation.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-orange text-white'
                    : 'text-blue-100/70 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
          {canUseOperatorRoutes &&
            operatorNavigation.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-orange text-white'
                      : 'text-blue-100/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="size-5" />
                <span className="min-w-0 flex-1 text-left">{label}</span>
              </NavLink>
            ))}
          {canUseManagerRoutes &&
            managerNavigation.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-orange text-white'
                      : 'text-blue-100/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="size-5" />
                <span className="min-w-0 flex-1 text-left">{label}</span>
              </NavLink>
            ))}
          {canUseManagerRoutes &&
            adminNavigation.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-orange text-white'
                      : 'text-blue-100/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="size-5" />
                <span className="min-w-0 flex-1 text-left">{label}</span>
              </NavLink>
            ))}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/40">
            Usuario
          </p>
          <div className="space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/conta"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-brand-orange text-white'
                        : 'text-blue-100/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <UserRound className="size-5" />
                  <span className="min-w-0 flex-1 text-left">Conta</span>
                </NavLink>
                <NavLink
                  to="/configuracoes"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-brand-orange text-white'
                        : 'text-blue-100/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Settings className="size-5" />
                  <span className="min-w-0 flex-1 text-left">Config</span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/70 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="size-5" />
                  <span className="min-w-0 flex-1 text-left">Sair</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/70 transition hover:bg-white/10 hover:text-white"
                >
                  <UserRound className="size-5" />
                  <span className="min-w-0 flex-1 text-left">Entrar</span>
                </NavLink>
                <NavLink
                  to="/cadastro"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/70 transition hover:bg-white/10 hover:text-white"
                >
                  <UserRound className="size-5" />
                  <span className="min-w-0 flex-1 text-left">Criar conta</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-brand-surface lg:h-screen lg:overflow-hidden lg:pl-[260px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-brand-navy lg:flex">
        {sidebar}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-brand-ink/60"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[82vw] max-w-80 flex-col bg-brand-navy shadow-2xl">
            <button
              aria-label="Fechar menu"
              className="absolute right-4 top-5 rounded-lg p-2 text-white"
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col lg:h-screen">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white/95 px-4 shadow-sm backdrop-blur sm:h-20 sm:px-8">
          <button
            aria-label="Abrir menu"
            className="rounded-xl border bg-white p-2 text-brand-navy shadow-sm lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-6" />
          </button>
          <div className="min-w-0 flex-1 px-4 lg:px-0">
            <p className="truncate text-sm font-semibold text-brand-navy">
              Toff Brasil
            </p>
            <p className="truncate text-xs text-slate-400">
              Login solicitado apenas para carrinho e compra
            </p>
          </div>
          <img
            src="/brand/logo-toffbr.jpeg"
            alt="Toff Brasil"
            className="size-10 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-slate-200 lg:hidden"
          />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
          {children}
          <div className="hidden lg:block">
            <Footer compact />
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(6,29,79,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileNavigation.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition',
                  isActive
                    ? 'bg-orange-50 text-brand-orange'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-navy',
                )
              }
            >
              <Icon className="size-5" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-brand-navy"
          >
            <Menu className="size-5" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
