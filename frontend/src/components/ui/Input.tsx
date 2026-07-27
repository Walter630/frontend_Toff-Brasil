import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function Input({ className, id, label, ...props }: InputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-extrabold text-brand-navy">
        {label}
      </span>
      <input
        id={id}
        className={cn(
          'h-12 w-full rounded-lg border bg-white px-4 text-sm font-semibold text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-brand-aqua-dark focus:ring-4 focus:ring-brand-aqua/15',
          className,
        )}
        {...props}
      />
    </label>
  )
}
