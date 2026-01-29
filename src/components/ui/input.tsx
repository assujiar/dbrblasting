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
          'flex h-11 w-full rounded-xl border bg-gray-50 px-4 py-2 text-sm text-gray-900 transition-all duration-200',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
            : 'border-gray-200 hover:border-gray-300',
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
