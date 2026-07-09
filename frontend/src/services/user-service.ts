import { api } from '../lib/api'
import type { UserResponse } from '../types/auth'

export type UserProfileUpdatePayload = {
  name?: string
  phone?: string
}

export type PasswordUpdatePayload = {
  currentPassword: string
  newPassword: string
}

function normalizeUser(data: unknown): UserResponse {
  const user = (data && typeof data === 'object' ? data : {}) as Record<
    string,
    unknown
  >

  return {
    name: String(user.name ?? user.nome ?? ''),
    email: String(user.email ?? ''),
    phone: typeof user.phone === 'string' ? user.phone : undefined,
    role: String(user.role ?? user.perfil ?? 'USER') as UserResponse['role'],
  }
}

function isRouteMissing(error: unknown) {
  if (!(error instanceof Error) || !('response' in error)) {
    return false
  }

  const response = error.response as { status?: number } | undefined
  return response?.status === 404 || response?.status === 405
}

export const userService = {
  async getProfile() {
    const { data } = await api.get('/usuarios/me')
    return normalizeUser(data)
  },

  async updateProfile(payload: UserProfileUpdatePayload) {
    const { data } = await api.patch('/usuarios/me', payload)
    return normalizeUser(data)
  },

  async changePassword(payload: PasswordUpdatePayload) {
    try {
      await api.patch('/usuarios/me/senha', {
        senhaAtual: payload.currentPassword,
        novaSenha: payload.newPassword,
      })
    } catch (error) {
      if (!isRouteMissing(error)) {
        throw error
      }

      await api.post('/auth/change-password', {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      })
    }
  },
}
