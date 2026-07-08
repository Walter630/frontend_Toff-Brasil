import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { cn } from '../../lib/cn'
import type { ProductFilterValue } from '../../lib/product-filters'

type CategoryOption = {
  label: string
  value: string
}

type DetailFilterOption = {
  label: string
  value: ProductFilterValue
}

export type DetailFilterGroup = {
  label: string
  value: ProductFilterValue
  onChange: (next: ProductFilterValue) => void
  options: readonly DetailFilterOption[]
}

type CatalogFilterPanelProps = {
  category: string
  categories: readonly CategoryOption[]
  detailGroups: readonly DetailFilterGroup[]
  resultCount: number
  onCategoryChange: (next: string) => void
  onReset: () => void
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { label: string; value: string }[]
  onChange: (next: string) => void
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-brand-navy outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function CatalogFilterPanel({
  category,
  categories,
  detailGroups,
  resultCount,
  onCategoryChange,
  onReset,
}: CatalogFilterPanelProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <section className="mt-5">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="inline-flex items-center gap-2 font-bold text-brand-navy">
            <SlidersHorizontal className="size-4 text-brand-orange" />
            Filtros
          </h3>
          <p className="text-sm text-slate-500">
            {resultCount} produtos encontrados
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filtersOpen && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-full border px-4 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:text-brand-orange"
            >
              <RotateCcw className="size-4" />
              Limpar
            </button>
          )}
          <button
            type="button"
            onClick={() => setFiltersOpen((current) => !current)}
            aria-expanded={filtersOpen}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-brand-orange bg-white px-4 text-sm font-semibold text-brand-orange transition hover:bg-orange-50"
          >
            {filtersOpen ? 'Ocultar' : 'Filtrar'}
            <ChevronDown
              className={cn(
                'size-4 transition',
                filtersOpen && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Categoria"
            value={category}
            options={categories}
            onChange={onCategoryChange}
          />
          {detailGroups.map(({ label, value, onChange, options }) => (
            <FilterSelect
              key={label}
              label={label}
              value={value}
              options={[{ label: 'Todos', value: 'Todos' }, ...options]}
              onChange={(next) => onChange(next as ProductFilterValue)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
