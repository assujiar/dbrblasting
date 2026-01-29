import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:from-primary-600 hover:to-primary-700 hover:shadow-lg active:scale-[0.98]',
        destructive:
          'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-md hover:from-error-600 hover:to-error-700 hover:shadow-lg active:scale-[0.98]',
        outline:
          'border border-neutral-200/60 bg-white/50 text-neutral-700 hover:bg-neutral-100/50 hover:border-neutral-300/60 active:scale-[0.98]',
        secondary:
          'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-md hover:from-secondary-600 hover:to-secondary-700 hover:shadow-lg active:scale-[0.98]',
        ghost:
          'text-neutral-700 hover:bg-neutral-100/50 hover:text-neutral-900',
        link:
          'text-primary-600 underline-offset-4 hover:underline',
        success:
          'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-md hover:from-success-600 hover:to-success-700 hover:shadow-lg active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
