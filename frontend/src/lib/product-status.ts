import type { Product } from '../types/product'

export type ProductAvailability = {
  label: string
  description: string
  tone: 'available' | 'warning' | 'neutral' | 'soon'
  canContact: boolean
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatAvailableDate(date?: string) {
  if (!date) {
    return null
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return dateFormatter.format(parsedDate)
}

export function getProductAvailability(product: Product): ProductAvailability {
  const status =
    product.status ?? (product.estoque > 0 ? 'DISPONIVEL' : 'SEM_ESTOQUE')

  if (status === 'EM_BREVE') {
    const date = formatAvailableDate(product.availableAt)
    return {
      label: 'Em breve',
      description:
        product.statusMessage ??
        (date
          ? `Previsao de chegada em ${date}.`
          : 'Este produto ainda nao esta disponivel.'),
      tone: 'soon',
      canContact: false,
    }
  }

  if (status === 'EM_PRODUCAO') {
    return {
      label: 'Em produção',
      description:
        product.statusMessage ?? 'Produto em produção, consulte a previsão.',
      tone: 'warning',
      canContact: true,
    }
  }

  if (status === 'PRE_VENDA') {
    return {
      label: 'Pré-venda',
      description:
        product.statusMessage ??
        `Previsão inicial de ${product.estoque} unidade${product.estoque === 1 ? '' : 's'}. Fale com nossa equipe para reservar.`,
      tone: 'warning',
      canContact: true,
    }
  }

  if (status === 'SEM_ESTOQUE' || product.estoque <= 0) {
    return {
      label: 'Sem estoque',
      description:
        product.statusMessage ??
        'Produto sem estoque no momento. Consulte a previsão de reposição.',
      tone: 'neutral',
      canContact: false,
    }
  }

  return {
    label: 'Disponível',
    description: `${product.estoque} unidade${product.estoque === 1 ? '' : 's'} em estoque`,
    tone: 'available',
    canContact: true,
  }
}

export function getAvailabilityClasses(tone: ProductAvailability['tone']) {
  const classes = {
    available: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-700 ring-amber-100',
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
    soon: 'bg-blue-50 text-brand-navy ring-blue-100',
  }

  return classes[tone]
}
