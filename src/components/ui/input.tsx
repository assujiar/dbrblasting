import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border bg-white/70 px-3 py-2 text-sm text-neutral-900 transition-all duration-200',
          'placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100/50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error 
            ? 'border-error-300 focus:border-error-400 focus:ring-error-500/30' 
            : 'border-neutral-200/60 hover:border-neutral-300/60',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
