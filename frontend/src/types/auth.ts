export type UserRole =
  | 'ADMIN'
  | 'USER'
  | 'CLIENT'
  | 'EMPLOYEE'
  | 'MANAGER'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token?: string
  accessToken?: string
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
  username: string
  role?: UserRole
}

export type UserResponse = {
  email: string
  name: string
  phone?: string
  role?: UserRole
}