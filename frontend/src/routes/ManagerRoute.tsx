import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { authService } from '../services/auth-service'
import { ProtectedRoute } from './ProtectedRoute'

type ManagerRouteProps = {
  children: ReactNode
}

export function ManagerRoute({ children }: ManagerRouteProps) {
  return (
    <ProtectedRoute>
      {import.meta.env.DEV || authService.canManageStore() ? (
        children
      ) : (
        <Navigate to="/catalogo" replace />
      )}
    </ProtectedRoute>
  )
}
