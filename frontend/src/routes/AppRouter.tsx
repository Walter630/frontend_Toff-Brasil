import type { ReactNode } from 'react'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AccountPage } from '../pages/AccountPage'
import { AdminProductsPage } from '../pages/AdminProductsPage'
import { CatalogPage } from '../pages/CatalogPage'
import { ComingSoonPage } from '../pages/ComingSoonPage'
import { DashboardPage } from '../pages/DashboardPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { OrdersPage } from '../pages/OrdersPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ManagerRoute } from './ManagerRoute'
import { ProtectedRoute } from './ProtectedRoute'

const protectedRoute = (page: ReactNode) => (
  <ProtectedRoute>{page}</ProtectedRoute>
)

const managerRoute = (page: ReactNode) => <ManagerRoute>{page}</ManagerRoute>

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
        <Route
          path="/carrinho"
          element={
            <ComingSoonPage
              title="Carrinho temporariamente indisponivel"
              description="Finalize pedidos pelo WhatsApp enquanto a integracao do carrinho com o backend e estabilizada."
            />
          }
        />
        <Route path="/pedidos" element={protectedRoute(<OrdersPage />)} />
        <Route
          path="/pedido-presencial"
          element={protectedRoute(
            <ComingSoonPage
              title="Pedido presencial em breve"
              description="A venda assistida sera liberada quando as regras de atendimento e pedidos estiverem conectadas ao backend definitivo."
            />,
          )}
        />
        <Route
          path="/cupons"
          element={protectedRoute(
            <ComingSoonPage
              title="Cupons em breve"
              description="A tela de cupons esta reservada para a area administrativa, mas permanece bloqueada enquanto a API oficial nao estiver pronta."
            />,
          )}
        />
        <Route
          path="/notificacoes"
          element={protectedRoute(
            <ComingSoonPage
              title="Notificacoes em breve"
              description="A central de avisos administrativos sera liberada quando houver persistencia e permissao de gerente no backend."
            />,
          )}
        />
        <Route path="/conta" element={protectedRoute(<AccountPage />)} />
        <Route
          path="/configuracoes"
          element={protectedRoute(
            <ComingSoonPage
              title="Configuracoes em breve"
              description="As configuracoes do painel ficam bloqueadas por enquanto para evitar ajustes sem backend definitivo."
            />,
          )}
        />
        <Route
          path="/integracoes"
          element={protectedRoute(
            <ComingSoonPage
              title="Integracoes em breve"
              description="Odoo, marketplaces e demais integracoes serao conectados em uma etapa separada. O WhatsApp segue configurado."
            />,
          )}
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
