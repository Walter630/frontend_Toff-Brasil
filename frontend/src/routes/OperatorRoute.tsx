import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { authService } from '../services/auth-service'
import { ProtectedRoute } from './ProtectedRoute'

type OperatorRouteProps = {
  children: ReactNode
}

export function OperatorRoute({ children }: OperatorRouteProps) {
  return (
    <ProtectedRoute>
      {import.meta.env.DEV || authService.canOperateStore() ? (
        children
      ) : (
        <Navigate to="/catalogo" replace />
      )}
    </ProtectedRoute>
  )
}
