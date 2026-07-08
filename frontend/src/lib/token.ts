type JwtPayload = {
  exp?: number
}

/** Lê o payload do JWT sem validar assinatura; a assinatura continua validada pelo backend. */
export function isTokenActive(token: string | null) {
  if (!token) return false

  try {
    const payloadPart = token.split('.')[1]
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalized)) as JwtPayload

    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
