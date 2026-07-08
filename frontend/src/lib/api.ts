import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api',
  timeout: 10_000,
})

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('toffbr:token') ??
    sessionStorage.getItem('toffbr:token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Um 401 confirma que o backend rejeitou a sessão, mesmo que o JWT pareça válido localmente.
    if (error.response?.status === 401) {
      for (const storage of [localStorage, sessionStorage]) {
        storage.removeItem('toffbr:token')
        storage.removeItem('toffbr:refresh-token')
        storage.removeItem('toffbr:user')
      }

    }

    return Promise.reject(error)
  },
)
