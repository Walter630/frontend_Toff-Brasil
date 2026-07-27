import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const TOKEN_KEY = 'toffbr:token'
const REFRESH_TOKEN_KEY = 'toffbr:refresh-token'
const USER_KEY = 'toffbr:user'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? '/api'

const REFRESH_PATH =
  import.meta.env.VITE_AUTH_REFRESH_PATH ??
  '/auth/refresh_token'

type RefreshResponse = {
  token?: string
  accessToken?: string
  refreshToken?: string
}

type RetryableRequestConfig =
  InternalAxiosRequestConfig & {
    _retry?: boolean
  }

function getStoredValue(key: string): string | null {
  return (
    localStorage.getItem(key) ??
    sessionStorage.getItem(key)
  )
}

function getAccessToken(): string | null {
  return getStoredValue(TOKEN_KEY)
}

function getRefreshToken(): string | null {
  return getStoredValue(REFRESH_TOKEN_KEY)
}

function getCurrentSessionStorage(): Storage {
  if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return localStorage
  }

  return sessionStorage
}

function clearSession(): void {
  for (const storage of [
    localStorage,
    sessionStorage,
  ]) {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(REFRESH_TOKEN_KEY)
    storage.removeItem(USER_KEY)
  }
}

function isAuthenticationPath(
  url?: string,
): boolean {
  if (!url) {
    return false
  }

  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh_token') ||
    url.includes(REFRESH_PATH)
  )
}

/**
 * Decodifica somente o payload do JWT.
 *
 * Isso não valida a assinatura. Essa função serve apenas
 * para verificar localmente se o token já expirou.
 */
function getJwtExpiration(
  token: string | null,
): number | null {
  if (!token) {
    return null
  }

  const parts = token.split('.')

  if (parts.length !== 3) {
    return null
  }

  try {
    const encodedPayload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const paddedPayload =
      encodedPayload.padEnd(
        encodedPayload.length +
          ((4 - (encodedPayload.length % 4)) % 4),
        '=',
      )

    const payload = JSON.parse(
      atob(paddedPayload),
    ) as {
      exp?: number
    }

    return payload.exp ?? null
  } catch {
    return null
  }
}

function isJwtExpired(
  token: string | null,
): boolean {
  const expiration = getJwtExpiration(token)

  if (!expiration) {
    return false
  }

  const currentTimeInSeconds =
    Math.floor(Date.now() / 1000)

  return expiration <= currentTimeInSeconds
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
})

/**
 * Esta instância não possui interceptors.
 *
 * Isso impede que a requisição de refresh entre
 * em um ciclo infinito de renovação.
 */
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
})

let refreshPromise: Promise<string> | null =
  null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error(
      'Sessão sem refresh token.',
    )
  }

  const { data } =
    await refreshApi.post<RefreshResponse>(
      REFRESH_PATH,
      {
        refreshToken,
      },
    )

  const accessToken =
    data.accessToken ?? data.token

  if (!accessToken) {
    throw new Error(
      'Resposta de refresh sem token de acesso.',
    )
  }

  const storage = getCurrentSessionStorage()

  storage.setItem(TOKEN_KEY, accessToken)

  /*
   * Caso o backend rotacione o refresh token,
   * armazenamos o novo valor.
   */
  if (data.refreshToken) {
    storage.setItem(
      REFRESH_TOKEN_KEY,
      data.refreshToken,
    )
  }

  return accessToken
}

/**
 * Adiciona o access token em requisições protegidas.
 */
api.interceptors.request.use((config) => {
  /*
   * Login, cadastro e refresh não precisam receber
   * um access token possivelmente expirado.
   */
  if (isAuthenticationPath(config.url)) {
    return config
  }

  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers =
      AxiosHeaders.from(config.headers)

    config.headers.set(
      'Authorization',
      `Bearer ${accessToken}`,
    )
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const currentAccessToken =
      getAccessToken()

    /*
     * O comportamento correto do backend é:
     *
     * 401 → token ausente, inválido ou expirado
     * 403 → usuário autenticado sem permissão
     *
     * Entretanto, seu backend está devolvendo 403
     * quando o token expira.
     *
     * Para não renovar em todo 403 legítimo,
     * só tratamos 403 como expiração quando o JWT
     * está efetivamente expirado.
     */
    const shouldRefresh =
      status === 401 ||
      (status === 403 &&
        isJwtExpired(currentAccessToken))

    if (!shouldRefresh) {
      return Promise.reject(error)
    }

    /*
     * Nunca tenta renovar quando a própria rota
     * de autenticação falha.
     */
    if (
      isAuthenticationPath(
        originalRequest.url,
      )
    ) {
      clearSession()
      return Promise.reject(error)
    }

    /*
     * Evita repetir a mesma requisição
     * indefinidamente.
     */
    if (originalRequest._retry) {
      clearSession()
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      clearSession()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const requestHeaders =
        AxiosHeaders.from(
          originalRequest.headers,
        )

      const requestAuthorization =
        requestHeaders.get('Authorization')

      const requestToken =
        typeof requestAuthorization ===
        'string'
          ? requestAuthorization.replace(
              /^Bearer\s+/i,
              '',
            )
          : null

      const latestStoredToken =
        getAccessToken()

      /*
       * Outra requisição pode ter renovado o token
       * enquanto esta requisição estava em andamento.
       *
       * Nesse caso, reutilizamos o token novo sem
       * fazer outro refresh.
       */
      const accessToken =
        latestStoredToken &&
        requestToken &&
        latestStoredToken !== requestToken
          ? latestStoredToken
          : await (refreshPromise ??=
              refreshAccessToken().finally(
                () => {
                  refreshPromise = null
                },
              ))

      requestHeaders.set(
        'Authorization',
        `Bearer ${accessToken}`,
      )

      originalRequest.headers =
        requestHeaders

      return api.request(originalRequest)
    } catch (refreshError) {
      clearSession()

      if (
        window.location.pathname !==
        '/login'
      ) {
        window.location.assign('/login')
      }

      return Promise.reject(refreshError)
    }
  },
)