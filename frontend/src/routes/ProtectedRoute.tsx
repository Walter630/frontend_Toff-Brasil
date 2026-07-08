import type { ReactNode } from 'react'

import { Navigate, useLocation } from 'react-router-dom'

import { authService } from '../services/auth-service'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
