import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

import { Button } from './ui/Button'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha na pagina', error, info.componentStack)
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <main className="grid min-h-screen place-items-center bg-brand-surface p-6">
        <section className="w-full max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600">Erro na pagina</p>
          <h1 className="mt-2 text-2xl font-bold text-brand-navy">
            Nao foi possivel carregar esta tela.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Motivo: {this.state.error.message || 'erro inesperado no navegador.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = '/catalogo'
              }}
            >
              Voltar ao catalogo
            </Button>
          </div>
        </section>
      </main>
    )
  }
}
