import { LoaderCircle, RefreshCw } from 'lucide-react'

import { Button } from '../ui/Button'

type CatalogStateProps = {
  loading: boolean
  error: string
  onRetry: () => void
}

/** Feedback padrão usado enquanto uma consulta à API não possui conteúdo. */
export function CatalogState({
  loading,
  error,
  onRetry,
}: CatalogStateProps) {
  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center rounded-2xl border bg-white">
        <LoaderCircle className="size-8 animate-spin text-brand-orange" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <p className="text-sm text-red-700">{error}</p>
      <Button className="mt-5" onClick={onRetry}>
        <RefreshCw className="size-4" />
        Tentar novamente
      </Button>
    </div>
  )
}
