import type { ReactNode } from 'react'

import {
  BadgePercent,
  BellRing,
  ClipboardList,
  Heart,
  Home,
  LockKeyhole,
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
]

const blockedNavigation = [
  { label: 'Carrinho', icon: ShoppingCart, to: '/carrinho' },
  { label: 'Atendimento', icon: ClipboardList, to: '/pedido-presencial' },
  { label: 'Cupons', icon: BadgePercent, to: '/cupons' },
  { label: 'Notificacoes', icon: BellRing, to: '/notificacoes' },
  { label: 'Favoritos', icon: Heart, to: '/favoritos' },
  { label: 'Pedidos', icon: ShoppingBag, to: '/pedidos' },
  { label: 'Integracoes', icon: PlugZap, to: '/integracoes' },
]

const adminNavigation = [
  { label: 'Admin produtos', icon: PackagePlus, to: '/admin' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const isAuthenticated = authService.isAuthenticated()
  const isManager = authService.isManager()

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

      <nav className="flex-1 overflow-y-auto px-4 py-6">
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
          {blockedNavigation.map(({ label, icon: Icon, to }) =>
            isAuthenticated ? (
              <NavLink
                key={label}
                to={to}
                onClick={closeMenu}
                title="Em breve"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-blue-100/50 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="size-5" />
                <span className="min-w-0 flex-1 text-left">{label}</span>
                <LockKeyhole className="size-3.5" />
              </NavLink>
            ) : (
              <button
                key={label}
                type="button"
                disabled
                title="Em breve"
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/35"
              >
                <Icon className="size-5" />
                <span className="min-w-0 flex-1 text-left">{label}</span>
                <LockKeyhole className="size-3.5" />
              </button>
            ),
          )}
          {isManager &&
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
                  title="Em breve"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-blue-100/50 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Settings className="size-5" />
                  <span className="min-w-0 flex-1 text-left">Config</span>
                  <LockKeyhole className="size-3.5" />
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
              <NavLink
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/70 transition hover:bg-white/10 hover:text-white"
              >
                <UserRound className="size-5" />
                <span className="min-w-0 flex-1 text-left">Entrar</span>
              </NavLink>
            )}
            {!isAuthenticated && (
              <button
                type="button"
                disabled
                title="Em breve"
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/35"
              >
                <Settings className="size-5" />
                <span className="min-w-0 flex-1 text-left">Config</span>
                <LockKeyhole className="size-3.5" />
              </button>
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
          <aside className="relative flex h-full w-72 flex-col bg-brand-navy">
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
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b bg-white px-5 sm:px-8">
          <button
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-brand-navy lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-6" />
          </button>
          <div>
            <p className="text-sm text-slate-500">Explore o catalogo Toff Brasil</p>
            <p className="text-xs text-slate-400">
              Login solicitado apenas para carrinho e compra
            </p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
          <Footer compact />
        </div>
      </div>
    </div>
  )
}
