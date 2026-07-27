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
        'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-extrabold transition disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'bg-brand-navy text-white shadow-sm hover:bg-brand-aqua hover:text-brand-navy',
        variant === 'secondary' &&
          'border border-slate-200 bg-white text-brand-navy hover:border-brand-aqua hover:bg-brand-aqua/10',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}
