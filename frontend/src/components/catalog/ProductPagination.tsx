import { ChevronLeft, ChevronRight } from 'lucide-react'

type ProductPaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function ProductPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="hidden text-xs font-bold text-slate-500 xl:block">
        Mostrando {start}-{end} de {totalItems} produtos
      </p>
      <div className="flex items-center gap-2">
        <button
          aria-label="Pagina anterior"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="grid size-9 place-items-center rounded-lg border bg-white text-brand-navy transition hover:border-brand-orange hover:text-brand-orange disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="min-w-16 text-center text-xs font-extrabold text-brand-navy">
          {page} de {totalPages}
        </span>
        <button
          aria-label="Proxima pagina"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="grid size-9 place-items-center rounded-lg border bg-white text-brand-navy transition hover:border-brand-orange hover:text-brand-orange disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}
