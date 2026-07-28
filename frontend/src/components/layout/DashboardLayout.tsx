import type { FormEvent, ReactNode } from 'react'

import {
  AlertTriangle,
  BadgePercent,
  BellRing,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Flame,
  Headphones,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MessageCircleMore,
  Moon,
  Package,
  PackagePlus,
  Phone,
  PlugZap,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import {
  cartUpdatedEvent,
  getCartUnitCount,
  type CartUpdatedDetail,
} from '../../lib/cart-events'
import { cn } from '../../lib/cn'
import { authService } from '../../services/auth-service'
import { cartService } from '../../services/cart-service'
import { CookieConsent } from './CookieConsent'
import { Footer } from './Footer'

const managerWhatsappNumber =
  import.meta.env.VITE_MANAGER_WHATSAPP ?? '553488560330'
const managerWhatsappUrl = `https://wa.me/${managerWhatsappNumber.replace(/\D/g, '')}`

type DashboardLayoutProps = {
  children: ReactNode
}

type HeaderTheme = 'light' | 'dark'

const headerThemeStorageKey = 'toffbr:header-theme'

const primaryNavigation = [
  { label: 'Início', icon: Home, to: '/' },
  {
    label: 'Filamentos',
    icon: Sparkles,
    to: '/catalogo?grupo=FILAMENTOS',
    columns: [
      {
        title: 'Material',
        links: [
          { label: 'PLA', to: '/catalogo?material=PLA' },
          { label: 'PETG', to: '/catalogo?material=PETG' },
          { label: 'ABS', to: '/catalogo?material=ABS' },
          { label: 'TPU', to: '/catalogo?material=TPU' },
        ],
      },
      {
        title: 'Acabamento',
        links: [
          { label: 'Básico', to: '/catalogo?grupo=FILAMENTOS&tipo=BASICO' },
          {
            label: 'High Speed',
            to: '/catalogo?grupo=FILAMENTOS&tipo=HIGH%20SPEED',
          },
          { label: 'Matte', to: '/catalogo?grupo=FILAMENTOS&tipo=MATTE' },
          { label: 'Silk', to: '/catalogo?grupo=FILAMENTOS&tipo=SILK' },
          { label: 'Metal', to: '/catalogo?grupo=FILAMENTOS&tipo=METAL' },
          {
            label: 'Translúcido',
            to: '/catalogo?grupo=FILAMENTOS&tipo=TRANSLUCIDO',
          },
        ],
      },
      {
        title: 'Marcas',
        links: [
          {
            label: 'Masterprint',
            to: '/catalogo?grupo=FILAMENTOS&marca=MASTERPRINT',
          },
          {
            label: 'FusionX',
            to: '/catalogo?grupo=FILAMENTOS&marca=FUSIONX',
          },
          {
            label: 'Elegoo',
            to: '/catalogo?grupo=FILAMENTOS&marca=ELEGOO',
          },
          {
            label: 'Fulljoy',
            to: '/catalogo?grupo=FILAMENTOS&marca=FULLJOY',
          },
          {
            label: 'Tinmory',
            to: '/catalogo?grupo=FILAMENTOS&marca=TINMORY',
          },
        ],
      },
    ],
  },
  {
    label: 'Marcas',
    icon: BadgePercent,
    to: '/catalogo',
    columns: [
      {
        title: 'Escolha sua marca',
        links: [
          { label: 'Masterprint', to: '/catalogo?marca=MASTERPRINT' },
          { label: 'FusionX', to: '/catalogo?marca=FUSIONX' },
          { label: 'Elegoo', to: '/catalogo?marca=ELEGOO' },
          { label: 'Fulljoy', to: '/catalogo?marca=FULLJOY' },
          { label: 'Tinmory', to: '/catalogo?marca=TINMORY' },
        ],
      },
    ],
  },
  {
    label: 'Impressoras 3D',
    icon: Package,
    to: '/catalogo?grupo=IMPRESSORAS',
    columns: [
      {
        title: 'Impressoras',
        links: [
          { label: 'Todas as impressoras', to: '/catalogo?grupo=IMPRESSORAS' },
          {
            label: 'Bambu Lab',
            to: '/catalogo?grupo=IMPRESSORAS&busca=Bambu%20Lab',
          },
          {
            label: 'A1 e A1 Mini',
            to: '/catalogo?grupo=IMPRESSORAS&busca=A1',
          },
        ],
      },
    ],
  },
  {
    label: 'Peças e acessórios',
    icon: Wrench,
    to: '/catalogo?grupo=ACESSORIOS',
    columns: [
      {
        title: 'Peças e acessórios',
        links: [
          { label: 'Ver todos', to: '/catalogo?grupo=ACESSORIOS' },
          {
            label: 'Bicos e hotends',
            to: '/catalogo?grupo=ACESSORIOS&busca=Bico',
          },
          {
            label: 'Placas de impressão',
            to: '/catalogo?grupo=ACESSORIOS&busca=Placa',
          },
          {
            label: 'Manutenção',
            to: '/catalogo?grupo=ACESSORIOS&busca=Lubrificante',
          },
        ],
      },
    ],
  },
  { label: 'Pré-venda', icon: Flame, to: '/catalogo?prevenda=1' },
]

const accountNavigation = [
  { label: 'Catálogo', icon: Package, to: '/catalogo' },
  { label: 'Carrinho', icon: ShoppingCart, to: '/carrinho' },
  { label: 'Pedidos', icon: ShoppingBag, to: '/pedidos' },
]

const operatorNavigation = [
  {
    label: 'Orçamento e venda',
    icon: ClipboardList,
    to: '/pedido-presencial',
  },
]

const managerNavigation = [
  { label: 'Painel admin', icon: LayoutDashboard, to: '/admin' },
  { label: 'Clientes', icon: UsersRound, to: '/admin/clientes' },
  { label: 'Produtos', icon: PackagePlus, to: '/admin/produtos' },
  { label: 'WhatsApp', icon: MessageCircleMore, to: '/admin/whatsapp' },
  { label: 'Cupons', icon: BadgePercent, to: '/cupons' },
  { label: 'Notificações', icon: BellRing, to: '/notificacoes' },
  { label: 'Integrações', icon: PlugZap, to: '/integracoes' },
]

const mobileNavigation = [
  { label: 'Início', icon: Home, to: '/dashboard' },
  { label: 'Catálogo', icon: Package, to: '/catalogo' },
  { label: 'Carrinho', icon: ShoppingCart, to: '/carrinho' },
  { label: 'Pedidos', icon: ShoppingBag, to: '/pedidos' },
]

const mobileStoreNavigation = [
  { label: 'Todos os produtos', to: '/catalogo' },
  { label: 'Filamentos PLA', to: '/catalogo?material=PLA' },
  { label: 'Filamentos PETG', to: '/catalogo?material=PETG' },
  { label: 'Filamentos ABS', to: '/catalogo?material=ABS' },
  { label: 'Filamentos TPU', to: '/catalogo?material=TPU' },
  { label: 'Impressoras 3D', to: '/catalogo?grupo=IMPRESSORAS' },
  { label: 'Peças e acessórios', to: '/catalogo?grupo=ACESSORIOS' },
  { label: 'Pré-venda', to: '/catalogo?prevenda=1' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null)
  const [search, setSearch] = useState(
    () => new URLSearchParams(location.search).get('busca') ?? '',
  )
  const [cartCount, setCartCount] = useState(0)
  const [addedProductName, setAddedProductName] = useState('')
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem(headerThemeStorageKey) === 'dark'
      ? 'dark'
      : 'light'
  })
  const toastTimerRef = useRef<number | undefined>(undefined)
  const searchTimerRef = useRef<number | undefined>(undefined)
  const isAuthenticated = authService.isAuthenticated()
  const canUseOperatorRoutes =
    import.meta.env.DEV || authService.canOperateStore()
  const canUseManagerRoutes =
    import.meta.env.DEV || authService.canManageStore()
  const darkHeader = headerTheme === 'dark'

  useEffect(() => {
    window.localStorage.setItem(headerThemeStorageKey, headerTheme)
  }, [headerTheme])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [location.pathname])

  useEffect(
    () => () => {
      window.clearTimeout(searchTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get('busca') ?? '')
  }, [location.search])

  useEffect(() => {
    if (!logoutDialogOpen) {
      return
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLogoutDialogOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [logoutDialogOpen])

  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0)
      return
    }

    const refreshCartCount = async () => {
      try {
        setCartCount(getCartUnitCount(await cartService.getMyCart()))
      } catch {
        // Mantém o cabeçalho disponível mesmo quando o carrinho estiver offline.
      }
    }

    const handleCartUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CartUpdatedDetail>).detail
      if (detail?.cart) setCartCount(getCartUnitCount(detail.cart))
      else void refreshCartCount()

      if (detail?.addedProductName) {
        setAddedProductName(detail.addedProductName)
        void refreshCartCount()
        window.clearTimeout(toastTimerRef.current)
        toastTimerRef.current = window.setTimeout(
          () => setAddedProductName(''),
          4500,
        )
      }
    }

    void refreshCartCount()
    window.addEventListener(cartUpdatedEvent, handleCartUpdated)
    return () => {
      window.removeEventListener(cartUpdatedEvent, handleCartUpdated)
      window.clearTimeout(toastTimerRef.current)
    }
  }, [isAuthenticated])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    window.clearTimeout(searchTimerRef.current)
    const query = search.trim()
    navigate(query ? `/catalogo?busca=${encodeURIComponent(query)}` : '/catalogo')
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    window.clearTimeout(searchTimerRef.current)
    searchTimerRef.current = window.setTimeout(() => {
      const query = value.trim()
      navigate(
        query ? `/catalogo?busca=${encodeURIComponent(query)}` : '/catalogo',
      )
    }, 350)
  }

  const handleLogout = () => {
    setMenuOpen(false)
    setLogoutDialogOpen(true)
  }

  const confirmLogout = () => {
    authService.clearSession()
    setLogoutDialogOpen(false)
    setMenuOpen(false)
    navigate('/dashboard')
  }

  const drawerLinks = [
    ...accountNavigation,
    ...(canUseOperatorRoutes ? operatorNavigation : []),
    ...(canUseManagerRoutes ? managerNavigation : []),
  ]

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="sticky top-0 z-40">
        <div className="hidden bg-brand-orange text-[11px] font-bold text-white sm:block">
          <div className="container-store flex h-8 items-center justify-center gap-6 sm:justify-between">
            <p className="flex items-center gap-2">
              <Sparkles className="size-3.5" />
              Tecnologia 3D com suporte de quem entende
            </p>
            <div className="hidden items-center gap-6 sm:flex">
              <span>Envio para todo o Brasil</span>
              <span className="h-3 w-px bg-white/30" />
              <span>Compra 100% segura</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'border-b transition-colors duration-200',
            darkHeader
              ? 'border-white/10 bg-black text-white'
              : 'border-slate-200 bg-white text-slate-950',
          )}
        >
          <div className="container-store relative flex h-[72px] items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMenuOpen(true)}
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-xl border transition lg:hidden',
                darkHeader
                  ? 'border-white/15 hover:bg-white/10'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
              )}
            >
              <Menu className="size-5" />
            </button>

            <form
              onSubmit={handleSearch}
              className="relative hidden w-[280px] lg:block xl:w-[320px]"
            >
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar produtos"
                className={cn(
                  'h-10 w-full rounded-lg border-0 pr-11 pl-10 text-xs font-semibold text-brand-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-orange',
                  darkHeader ? 'bg-white' : 'bg-slate-100',
                )}
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute top-1 right-1 grid size-8 place-items-center rounded-md bg-brand-orange text-white transition hover:bg-brand-orange-dark"
              >
                <Search className="size-3.5" />
              </button>
            </form>

            <Link
              to="/"
              className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5"
            >
              <span className="grid size-10 place-items-center overflow-hidden rounded-lg bg-white p-0.5 sm:size-11">
                <img
                  src="/brand/logo-toffbr.jpeg"
                  alt="Toff Brasil"
                  className="size-full object-contain"
                />
              </span>
              <span className="hidden leading-none sm:block">
                <strong
                  className={cn(
                    'block text-base font-black tracking-tight',
                    darkHeader ? 'text-white' : 'text-slate-950',
                  )}
                >
                  Toff Brasil
                </strong>
                <small
                  className={cn(
                    'mt-1 block text-[9px] font-bold tracking-[0.14em] uppercase',
                    darkHeader ? 'text-white/45' : 'text-slate-500',
                  )}
                >
                  Impressão 3D
                </small>
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-1 sm:gap-3">
              {isAuthenticated && authService.canManageStore() && (
                <Link
                  to="/admin"
                  className="hidden h-11 items-center gap-2 rounded-xl bg-brand-orange px-3 text-xs font-black text-white transition hover:bg-brand-orange-dark sm:inline-flex"
                  aria-label="Abrir painel administrativo"
                >
                  <LayoutDashboard className="size-4" />
                  <span className="hidden xl:inline">Painel admin</span>
                </Link>
              )}
              <Link
                to={isAuthenticated ? '/conta' : '/login'}
                className={cn(
                  'hidden items-center gap-2 rounded-xl px-2 py-2 transition sm:flex sm:px-3',
                  darkHeader
                    ? 'text-white/80 hover:bg-white/10 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                )}
              >
                <UserRound className="size-5" />
                <span className="hidden text-xs leading-tight lg:block">
                  <small
                    className={cn(
                      'block',
                      darkHeader ? 'text-white/50' : 'text-slate-500',
                    )}
                  >
                    {isAuthenticated ? 'Minha área' : 'Olá, entre'}
                  </small>
                  <strong>{isAuthenticated ? 'Minha conta' : 'Login / Cadastro'}</strong>
                </span>
              </Link>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    'hidden h-11 items-center gap-2 rounded-xl px-3 transition sm:flex',
                    darkHeader
                      ? 'text-white/70 hover:bg-red-500/15 hover:text-red-200'
                      : 'text-slate-500 hover:bg-red-50 hover:text-red-600',
                  )}
                  aria-label="Sair da conta"
                  title="Sair da conta"
                >
                  <LogOut className="size-5" />
                  <span className="hidden text-xs font-bold 2xl:inline">Sair</span>
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setHeaderTheme((current) =>
                    current === 'light' ? 'dark' : 'light',
                  )
                }
                aria-label={
                  darkHeader ? 'Ativar tema claro' : 'Ativar tema escuro'
                }
                title={darkHeader ? 'Ativar tema claro' : 'Ativar tema escuro'}
                className={cn(
                  'grid size-11 place-items-center rounded-xl transition',
                  darkHeader
                    ? 'bg-white/8 hover:bg-white/15'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                )}
              >
                {darkHeader ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                )}
              </button>
              <Link
                to="/carrinho"
                aria-label="Abrir carrinho"
                className={cn(
                  'relative grid size-11 place-items-center rounded-xl transition',
                  darkHeader
                    ? 'bg-white/8 hover:bg-white/15'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200',
                )}
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-brand-orange px-1 text-[10px] font-black text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="container-store relative pb-3 lg:hidden"
          >
            <Search className="absolute top-1/2 left-7 size-4 -translate-y-[calc(50%+0.375rem)] text-slate-400" />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Buscar produtos"
              className={cn(
                'h-11 w-full rounded-lg border-0 pr-12 pl-11 text-sm font-semibold text-brand-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-orange',
                darkHeader ? 'bg-white' : 'bg-slate-100',
              )}
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute top-1 right-5 grid size-9 place-items-center rounded-md bg-brand-orange text-white"
            >
              <Search className="size-4" />
            </button>
          </form>

          <nav
            className={cn(
              'relative hidden border-t transition-colors duration-200 lg:block',
              darkHeader
                ? 'border-white/10 bg-[#282a30] shadow-[inset_0_1px_0_rgba(255,255,255,.04)]'
                : 'border-slate-200 bg-white shadow-sm',
            )}
            onMouseLeave={() => setOpenMegaMenu(null)}
          >
            <div className="container-store flex h-11 items-center justify-center gap-1">
              {primaryNavigation.map(({ label, icon: Icon, to, columns }) => {
                const [pathname, query = ''] = to.split('?')
                const isActive =
                  location.pathname === pathname &&
                  (pathname === '/'
                    ? true
                    : query
                      ? location.search === `?${query}`
                      : location.search === '')

                return (
                  <div
                    key={label}
                    className="h-full"
                    onMouseEnter={() => columns && setOpenMegaMenu(label)}
                  >
                    <Link
                      to={to}
                      onClick={(event) => {
                        if (columns && openMegaMenu !== label) {
                          event.preventDefault()
                          setOpenMegaMenu(label)
                        } else {
                          setOpenMegaMenu(null)
                        }
                      }}
                      aria-expanded={columns ? openMegaMenu === label : undefined}
                      className={cn(
                        'flex h-full items-center gap-2 px-5 text-xs font-bold transition',
                        isActive || openMegaMenu === label
                          ? darkHeader
                            ? 'bg-black/25 text-brand-orange'
                            : 'bg-orange-50 text-brand-orange'
                          : darkHeader
                            ? 'text-white/80 hover:bg-white/8 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                      )}
                    >
                      <Icon className="size-3.5" />
                      {label}
                      {columns && (
                        <ChevronDown
                          className={cn(
                            'size-3 transition',
                            openMegaMenu === label && 'rotate-180',
                          )}
                        />
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>

            {primaryNavigation.map(
              ({ label, to, columns }) =>
                columns &&
                openMegaMenu === label && (
                  <div
                    key={`${label}-menu`}
                    className="absolute top-full left-1/2 min-h-[320px] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-b-xl border border-t-0 border-slate-100 bg-white text-brand-ink shadow-[0_22px_48px_rgba(0,0,0,.2)]"
                  >
                    <div className="flex min-h-[320px] gap-7 p-7">
                      <div className="w-40 shrink-0 border-r border-slate-100 pr-6">
                        <p className="text-[10px] font-black tracking-[0.18em] text-brand-orange uppercase">
                          Explorar
                        </p>
                        <h2 className="mt-2 text-lg font-black text-slate-950">
                          {label}
                        </h2>
                        <Link
                          to={to}
                          onClick={() => setOpenMegaMenu(null)}
                          className="mt-4 inline-flex text-xs font-extrabold text-brand-orange hover:underline"
                        >
                          Ver todos →
                        </Link>
                      </div>

                      <div
                        className={cn(
                          'grid flex-1 gap-x-8 gap-y-5',
                          columns.length === 1
                            ? 'grid-cols-1'
                            : columns.length === 2
                              ? 'grid-cols-2'
                              : 'grid-cols-3',
                        )}
                      >
                        {columns.map((column) => (
                          <section key={column.title}>
                            <h3 className="border-b border-slate-100 pb-2 text-[10px] font-black tracking-[0.16em] text-slate-400 uppercase">
                              {column.title}
                            </h3>
                            <div className="mt-2 grid gap-0.5">
                              {column.links.map((link) => (
                                <Link
                                  key={link.to}
                                  to={link.to}
                                  onClick={() => setOpenMegaMenu(null)}
                                  className="rounded-md px-2 py-2 text-xs font-bold text-slate-600 transition hover:bg-orange-50 hover:text-brand-orange"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
            )}
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[88vw] max-w-sm flex-col bg-white text-slate-950 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <img
                src="/brand/logo-toffbr.jpeg"
                alt="Toff Brasil"
                className="size-11 rounded-xl bg-white object-contain"
              />
              <div>
                <strong className="block">Toff Brasil</strong>
                <span className="text-xs font-semibold text-brand-orange">
                  Tudo para impressão 3D
                </span>
              </div>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
                className="ml-auto grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <p className="px-3 pb-2 text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase">
                Comprar
              </p>
              <div className="mb-6 grid gap-1">
                {mobileStoreNavigation.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center justify-between rounded-lg border-b border-slate-100 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-brand-orange"
                  >
                    {item.label}
                    <ChevronDown className="size-4 -rotate-90 text-slate-300" />
                  </Link>
                ))}
              </div>

              <p className="px-3 pb-2 text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase">
                Minha conta
              </p>
              {drawerLinks.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={`${label}-${to}`}
                  to={to}
                  end={to === '/admin'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition',
                      isActive
                        ? 'bg-orange-50 text-brand-orange'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    )
                  }
                >
                  <Icon className="size-4.5" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-slate-200 p-4">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="size-4.5" />
                  Sair da conta
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white"
                >
                  Entrar ou criar conta
                </Link>
              )}
              <p className="mt-4 flex items-center gap-2 px-3 text-xs text-slate-400">
                <Headphones className="size-4 text-brand-orange" />
                Atendimento especializado
              </p>
            </div>
          </aside>
        </div>
      )}

      {logoutDialogOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <button
            type="button"
            aria-label="Cancelar saída da conta"
            className="absolute inset-0 bg-brand-navy/75 backdrop-blur-sm"
            onClick={() => setLogoutDialogOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]"
          >
            <div className="h-1.5 bg-gradient-to-r from-brand-orange via-orange-400 to-brand-aqua" />
            <button
              type="button"
              aria-label="Fechar confirmação"
              onClick={() => setLogoutDialogOpen(false)}
              className="absolute top-5 right-5 grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-brand-navy"
            >
              <X className="size-4" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="grid size-14 place-items-center rounded-2xl bg-orange-100 text-brand-orange ring-8 ring-orange-50">
                <AlertTriangle className="size-7" />
              </div>

              <h2
                id="logout-dialog-title"
                className="mt-6 text-2xl font-black text-brand-navy"
              >
                Deseja sair da conta?
              </h2>
              <p
                id="logout-dialog-description"
                className="mt-2 text-sm leading-6 text-slate-500"
              >
                Você precisará entrar novamente para acessar seus pedidos,
                carrinho e dados da conta.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setLogoutDialogOpen(false)}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-brand-navy transition hover:border-brand-aqua hover:bg-brand-aqua/10"
                >
                  Continuar na conta
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                >
                  <LogOut className="size-4" />
                  Sair da conta
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="min-h-[60vh]">{children}</div>
      <Footer />

      <nav className="hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileNavigation.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition',
                  isActive
                    ? 'bg-brand-aqua/15 text-brand-aqua-dark'
                    : 'text-slate-500',
                )
              }
            >
              <span className="relative">
                <Icon className="size-5" />
                {to === '/carrinho' && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 grid min-w-4 place-items-center rounded-full bg-brand-orange px-1 text-[8px] text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-500"
          >
            <Menu className="size-5" />
            Mais
          </button>
        </div>
      </nav>

      {addedProductName && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-20 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl sm:bottom-6 lg:right-24"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-brand-navy">Adicionado ao carrinho</p>
              <p className="mt-0.5 truncate text-sm text-slate-500">
                {addedProductName}
              </p>
              <Link
                to="/carrinho"
                onClick={() => setAddedProductName('')}
                className="mt-3 inline-flex text-sm font-bold text-brand-aqua-dark"
              >
                Ver carrinho →
              </Link>
            </div>
            <button
              type="button"
              aria-label="Fechar confirmação"
              onClick={() => setAddedProductName('')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
      <a
        href={managerWhatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a ToffBrasil pelo WhatsApp"
        className="fixed right-2 bottom-32 z-40 grid size-11 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_28px_rgba(37,211,102,.38)] ring-4 ring-white transition hover:-translate-y-1 hover:bg-[#1fbd5b] sm:right-4 sm:bottom-6 sm:size-12 lg:right-6"
      >
        <span className="relative grid size-7 place-items-center">
          <MessageCircle className="absolute inset-0 size-7 stroke-[2.2]" />
          <Phone className="size-3.5 fill-white stroke-[2.6]" />
        </span>
      </a>
      <CookieConsent />
    </div>
  )
}
