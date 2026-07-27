import type { ReactNode } from 'react'
import { lazy, Suspense } from 'react'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'

import { ManagerRoute } from './ManagerRoute'
import { OperatorRoute } from './OperatorRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { authService } from '../services/auth-service'

// Lazy-loaded pages (each becomes a separate chunk)
const LandingPage = lazy(() => import('../pages/LandingPage').then(m => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const CatalogPage = lazy(() => import('../pages/CatalogPage').then(m => ({ default: m.CatalogPage })))
const ProductDetailsPage = lazy(() => import('../pages/ProductDetailsPage').then(m => ({ default: m.ProductDetailsPage })))
const CartPage = lazy(() => import('../pages/CartPage').then(m => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })))
const OrdersPage = lazy(() => import('../pages/OrdersPage').then(m => ({ default: m.OrdersPage })))
const AccountPage = lazy(() => import('../pages/AccountPage').then(m => ({ default: m.AccountPage })))
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const InPersonOrderPage = lazy(() => import('../pages/InPersonOrderPage').then(m => ({ default: m.InPersonOrderPage })))
const CouponsPage = lazy(() => import('../pages/CouponsPage').then(m => ({ default: m.CouponsPage })))
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const IntegrationsPage = lazy(() => import('../pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))
const WhatsappAdminPage = lazy(() => import('../pages/WhatsappAdminPage').then(m => ({ default: m.WhatsappAdminPage })))
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminProductsPage = lazy(() => import('../pages/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })))
const AdminCustomersPage = lazy(() => import('../pages/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })))

function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <LoaderCircle className="size-8 animate-spin text-brand-orange" />
    </div>
  )
}

const protectedRoute = (page: ReactNode) => (
  <ProtectedRoute>{page}</ProtectedRoute>
)

const managerRoute = (page: ReactNode) => <ManagerRoute>{page}</ManagerRoute>
const operatorRoute = (page: ReactNode) => <OperatorRoute>{page}</OperatorRoute>

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/inicio" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              authService.canManageStore() ? (
                <Navigate to="/admin" replace />
              ) : (
                <DashboardPage />
              )
            }
          />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/produtos/:id" element={<ProductDetailsPage />} />
          <Route
            path="/favoritos"
            element={<Navigate to="/catalogo" replace />}
          />
          <Route path="/carrinho" element={protectedRoute(<CartPage />)} />
          <Route path="/checkout" element={protectedRoute(<CheckoutPage />)} />
          <Route path="/pedidos" element={protectedRoute(<OrdersPage />)} />
          <Route
            path="/pedido-presencial"
            element={operatorRoute(<InPersonOrderPage />)}
          />
          <Route path="/cupons" element={managerRoute(<CouponsPage />)} />
          <Route
            path="/notificacoes"
            element={managerRoute(<NotificationsPage />)}
          />
          <Route path="/conta" element={protectedRoute(<AccountPage />)} />
          <Route
            path="/configuracoes"
            element={protectedRoute(<SettingsPage />)}
          />
          <Route
            path="/integracoes"
            element={managerRoute(<IntegrationsPage />)}
          />
          <Route
            path="/admin/whatsapp"
            element={managerRoute(<WhatsappAdminPage />)}
          />
          <Route
            path="/admin/whatsapp/preview"
            element={
              import.meta.env.DEV ? (
                <WhatsappAdminPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/admin" element={managerRoute(<AdminDashboardPage />)} />
          <Route
            path="/admin/produtos"
            element={managerRoute(<AdminProductsPage />)}
          />
          <Route
            path="/admin/clientes"
            element={managerRoute(<AdminCustomersPage />)}
          />
          <Route
            path="/administrador"
            element={<Navigate to="/admin" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
