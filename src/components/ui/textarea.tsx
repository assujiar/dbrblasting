import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          'flex min-h-[120px] w-full rounded-xl px-4 py-3 text-sm',
          // Glass effect
          'bg-white/80 backdrop-blur-sm',
          'border border-neutral-200/60',
          'shadow-sm',
          // Typography
          'text-neutral-900 placeholder:text-neutral-400',
          // Resize
          'resize-y',
          // Transitions
          'transition-all duration-200',
          // Focus state
          'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400',
          'focus:bg-white focus:shadow-md',
          // Hover state
          'hover:border-neutral-300',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100/80 disabled:resize-none',
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
Textarea.displayName = 'Textarea'

export { Textarea }
