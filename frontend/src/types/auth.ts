export type UserRole =
  | 'USER'
  | 'MANAGER'
  | 'ADMIN'
  | 'CAIXA'
  | 'CASHIER'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  refreshToken: string
  user?: Partial<UserResponse>
  usuario?: Partial<UserResponse>
  role?: UserRole
  perfil?: UserRole
}

export type RegisterRequest = {
  email: string
  password: string
  phone: string
  name: string
  role?: Extract<UserRole, 'USER'>
}

export type UserResponse = {
  email: string
  name: string
  phone?: string
  role?: UserRole
}
