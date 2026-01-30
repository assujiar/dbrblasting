import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#977EF2]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[#040404] text-white shadow-sm shadow-black/20 hover:bg-[#2b2b2b] hover:shadow-md',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/20 hover:from-red-600 hover:to-red-700 hover:shadow-lg',
        outline:
          'border border-[#DDDCE1] bg-white text-[#4E4D5C] hover:border-[#977EF2]/60 hover:text-[#040404]',
        secondary:
          'bg-[#977EF2] text-white shadow-sm shadow-[#977EF2]/30 hover:bg-[#8050db]',
        ghost:
          'text-[#4E4D5C] hover:bg-[#EEEAF7] hover:text-[#040404]',
        link:
          'text-[#5B46FB] underline-offset-4 hover:underline',
        success:
          'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/20 hover:from-green-600 hover:to-green-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-lg text-xs',
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
