import axios from 'axios'

type ApiErrorBody = {
  message?: string
  error?: string
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação.',
) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback
  }

  if (!error.response) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
  }

  return (
    error.response.data?.message ??
    error.response.data?.error ??
    fallback
  )
}
