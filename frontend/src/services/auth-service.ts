import { api } from '../lib/api'
import { loginSharedCatalogManager } from '../lib/shared-product-db'
import { isTokenActive } from '../lib/token'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserRole,
  UserResponse,
} from '../types/auth'

const TOKEN_KEY = 'toffbr:token'
const REFRESH_TOKEN_KEY = 'toffbr:refresh-token'
const USER_KEY = 'toffbr:user'

const managerEmailHashes = new Set([
  '5a990c037b0f13ab647c8bad2ee65e6d2a70d4624f8dd4f2fd4ac1e9dbfe3e68',
  '487a4d9981a33da939894f9ecaeabec97deb07306c7fce9973d830ea3c432c2d',
])
const adminEmailHashes = new Set([
  '14080acbbf5c8f75551eb0756bb9d27ce13d23a4876513c7b6c951fce5d1a72f',
])
const adminEmailOverrides = new Set(['walter46@example.com'])
const shouldUseBackendAuth = import.meta.env.VITE_AUTH_SOURCE === 'api'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeRole(role?: string) {
  return role?.trim().toUpperCase() as UserRole | undefined
}

function applyLocalRoleOverrides(user: UserResponse) {
  if (adminEmailOverrides.has(normalizeEmail(user.email))) {
    return {
      ...user,
      role: 'ADMIN',
    } satisfies UserResponse
  }

  return user
}

function getLoginUser(
  data: LoginResponse,
  email: string,
  fallbackRole: UserRole,
) {
  const user = data.user ?? data.usuario
  const backendRole =
    normalizeRole(user?.role) ??
    normalizeRole(data.role) ??
    normalizeRole(data.perfil)
  const role = fallbackRole !== 'USER' ? fallbackRole : backendRole ?? fallbackRole

  return {
    email: user?.email ?? email,
    name: user?.name ?? email,
    phone: user?.phone,
    role,
  } satisfies UserResponse
}

async function hashText(value: string) {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function getFallbackRole(email: string): Promise<UserRole> {
  const emailHash = await hashText(normalizeEmail(email))

  if (adminEmailHashes.has(emailHash)) {
    return 'ADMIN'
  }

  if (managerEmailHashes.has(emailHash)) {
    return 'MANAGER'
  }

  return 'USER'
}

function createLocalToken() {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  }
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `local.${encodedPayload}.catalogo`
}

function shouldUseLocalManagerLogin(error: unknown, isManager: boolean) {
  if (!import.meta.env.DEV) {
    return false
  }

  if (!isManager) {
    return false
  }

  if (!(error instanceof Error) || !('response' in error)) {
    return true
  }

  const response = error.response as { status?: number } | undefined
  return !response || [500, 502, 503, 504].includes(response.status ?? 0)
}

function shouldTrySharedManagerLogin(error: unknown) {
  if (!(error instanceof Error) || !('response' in error)) {
    return true
  }

  const response = error.response as { status?: number } | undefined
  return !response || [500, 502, 503, 504].includes(response.status ?? 0)
}

function persistSession(user: UserResponse, token: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage

  authService.clearSession()
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(REFRESH_TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Único ponto responsável por autenticação e persistência da sessão.
 * "Lembrar de mim" usa localStorage; uma sessão comum usa sessionStorage.
 */
export const authService = {
  async login(credentials: LoginRequest, remember: boolean) {
    const email = normalizeEmail(credentials.email)
    const fallbackRole = await getFallbackRole(email)
    const isManager = fallbackRole === 'MANAGER' || fallbackRole === 'ADMIN'

    if (!shouldUseBackendAuth) {
      const sharedLogin = await loginSharedCatalogManager(
        email,
        credentials.password,
      )

      persistSession(sharedLogin.user, sharedLogin.token, remember)
      return {
        token: sharedLogin.token,
        refreshToken: sharedLogin.refreshToken,
      }
    }

    try {
      const { data } = await api.post<LoginResponse>('/auth/login', {
        ...credentials,
        email,
      })

      persistSession(getLoginUser(data, email, fallbackRole), data.token, remember)

      return data
    } catch (error) {
      if (!shouldUseBackendAuth && shouldTrySharedManagerLogin(error)) {
        try {
          const sharedLogin = await loginSharedCatalogManager(
            email,
            credentials.password,
          )

          persistSession(sharedLogin.user, sharedLogin.token, remember)
          return {
            token: sharedLogin.token,
            refreshToken: sharedLogin.refreshToken,
          }
        } catch (sharedError) {
          if (!isManager) {
            throw sharedError
          }
        }
      }

      if (shouldUseLocalManagerLogin(error, isManager)) {
        const token = createLocalToken()
        persistSession(
          {
            email,
            name: email,
            role: 'MANAGER',
          },
          token,
          remember,
        )

        return { token, refreshToken: token }
      }

      throw error
    }
  },

  async register(payload: RegisterRequest) {
    const { data } = await api.post<UserResponse>('/auth/register', payload)
    return data
  },

  isAuthenticated() {
    const token =
      localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
    const hasInvalidProductionToken =
      !import.meta.env.DEV &&
      !shouldUseBackendAuth &&
      Boolean(token) &&
      !token?.startsWith('catalog.')

    if (hasInvalidProductionToken) {
      this.clearSession()
      return false
    }

    const authenticated = isTokenActive(token)

    if (!authenticated) {
      this.clearSession()
    }

    return authenticated
  },

  getUser(): UserResponse | null {
    const value =
      localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)

    if (!value) {
      return null
    }

    try {
      return applyLocalRoleOverrides(JSON.parse(value) as UserResponse)
    } catch {
      return null
    }
  },

  isManager() {
    const user = this.getUser()
    const role = normalizeRole(user?.role)

    return role === 'MANAGER' || role === 'ADMIN'
  },

  canManageStore() {
    const role = normalizeRole(this.getUser()?.role)

    return role === 'MANAGER' || role === 'ADMIN'
  },

  canOperateStore() {
    const role = normalizeRole(this.getUser()?.role)

    return (
      role === 'MANAGER' ||
      role === 'ADMIN' ||
      role === 'CAIXA' ||
      role === 'CASHIER'
    )
  },

  canScanProducts() {
    const role = normalizeRole(this.getUser()?.role)

    return (
      role === 'MANAGER' ||
      role === 'ADMIN' ||
      role === 'CAIXA' ||
      role === 'CASHIER'
    )
  },

  clearSession() {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(TOKEN_KEY)
      storage.removeItem(REFRESH_TOKEN_KEY)
      storage.removeItem(USER_KEY)
    }
  },
}
