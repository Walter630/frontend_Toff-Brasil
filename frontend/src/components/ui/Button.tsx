import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'bg-brand-orange text-white shadow-sm hover:bg-brand-orange-dark',
        variant === 'secondary' &&
          'border border-slate-200 bg-white text-brand-navy hover:bg-slate-50',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}
