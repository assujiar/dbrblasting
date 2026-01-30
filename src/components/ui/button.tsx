import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-r from-primary-600 to-primary-700',
          'text-white shadow-md shadow-primary-500/25',
          'hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:shadow-primary-500/30',
          'hover:-translate-y-0.5',
        ].join(' '),
        secondary: [
          'bg-gradient-to-r from-accent-500 to-accent-600',
          'text-white shadow-md shadow-accent-500/25',
          'hover:from-accent-600 hover:to-accent-700 hover:shadow-lg hover:shadow-accent-500/30',
          'hover:-translate-y-0.5',
        ].join(' '),
        destructive: [
          'bg-gradient-to-r from-error-500 to-error-600',
          'text-white shadow-md shadow-error-500/25',
          'hover:from-error-600 hover:to-error-700 hover:shadow-lg hover:shadow-error-500/30',
          'hover:-translate-y-0.5',
        ].join(' '),
        success: [
          'bg-gradient-to-r from-success-500 to-success-600',
          'text-white shadow-md shadow-success-500/25',
          'hover:from-success-600 hover:to-success-700 hover:shadow-lg hover:shadow-success-500/30',
          'hover:-translate-y-0.5',
        ].join(' '),
        outline: [
          'border-2 border-neutral-200 bg-white/80 backdrop-blur-sm',
          'text-neutral-700 shadow-sm',
          'hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-700',
        ].join(' '),
        ghost: [
          'text-neutral-600',
          'hover:bg-neutral-100/80 hover:text-neutral-900',
        ].join(' '),
        link: [
          'text-primary-600 underline-offset-4',
          'hover:text-primary-700 hover:underline',
        ].join(' '),
        glass: [
          'bg-white/70 backdrop-blur-md border border-white/40',
          'text-neutral-700 shadow-glass',
          'hover:bg-white/80 hover:border-white/60 hover:shadow-lg',
        ].join(' '),
      },
      size: {
        default: 'h-11 px-5 py-2.5 text-sm rounded-xl',
        sm: 'h-9 px-4 py-2 text-xs rounded-lg',
        lg: 'h-12 px-6 py-3 text-base rounded-xl',
        xl: 'h-14 px-8 py-4 text-base rounded-2xl',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
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
            <span>{children}</span>
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
