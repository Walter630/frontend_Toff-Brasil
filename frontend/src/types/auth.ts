export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  refreshToken: string
}

export type RegisterRequest = {
  email: string
  password: string
  phone: string
  name: string
  role?: 'USER'
}

export type UserResponse = {
  email: string
  name: string
  role?: 'USER' | 'MANAGER'
}
