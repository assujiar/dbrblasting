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
          // Base styles
          'flex w-full h-11 px-4 py-2.5 rounded-xl text-sm',
          // Glass effect
          'bg-white/80 backdrop-blur-sm',
          'border border-neutral-200/60',
          'shadow-sm',
          // Typography
          'text-neutral-900 placeholder:text-neutral-400',
          // Transitions
          'transition-all duration-200',
          // Focus state
          'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400',
          'focus:bg-white focus:shadow-md',
          // Hover state
          'hover:border-neutral-300',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100/80',
          // File input styles
          'file:border-0 file:bg-primary-100 file:text-primary-700 file:text-sm file:font-medium file:rounded-lg file:px-3 file:py-1 file:mr-3',
          // Error state
          error && [
            'border-error-300 focus:border-error-400 focus:ring-error-400/30',
            'hover:border-error-400',
          ],
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
