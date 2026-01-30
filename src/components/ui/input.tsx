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
          'flex h-11 w-full rounded-xl border bg-white px-4 py-2 text-sm text-[#040404] transition-all duration-200',
          'placeholder:text-[#AAA7B4]',
          'focus:outline-none focus:ring-2 focus:ring-[#977EF2]/20 focus:border-[#977EF2] focus:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F3F2F6]',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
            : 'border-[#DDDCE1] hover:border-[#AFCCEF]',
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
