import type { ReactNode } from 'react'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AccountPage } from '../pages/AccountPage'
import { AdminProductsPage } from '../pages/AdminProductsPage'
import { CatalogPage } from '../pages/CatalogPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { CouponsPage } from '../pages/CouponsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { InPersonOrderPage } from '../pages/InPersonOrderPage'
import { IntegrationsPage } from '../pages/IntegrationsPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { OrdersPage } from '../pages/OrdersPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ManagerRoute } from './ManagerRoute'
import { OperatorRoute } from './OperatorRoute'
import { ProtectedRoute } from './ProtectedRoute'

const protectedRoute = (page: ReactNode) => (
  <ProtectedRoute>{page}</ProtectedRoute>
)

const managerRoute = (page: ReactNode) => <ManagerRoute>{page}</ManagerRoute>
const operatorRoute = (page: ReactNode) => <OperatorRoute>{page}</OperatorRoute>

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/inicio" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/produtos/:id" element={<ProductDetailsPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/carrinho" element={protectedRoute(<CartPage />)} />
        <Route path="/checkout" element={protectedRoute(<CheckoutPage />)} />
        <Route path="/pedidos" element={protectedRoute(<OrdersPage />)} />
        <Route
          path="/pedido-presencial"
          element={operatorRoute(<InPersonOrderPage />)}
        />
        <Route
          path="/cupons"
          element={managerRoute(<CouponsPage />)}
        />
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
          path="/admin"
          element={managerRoute(<AdminProductsPage />)}
        />
        <Route
          path="/administrador"
          element={managerRoute(<AdminProductsPage />)}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
