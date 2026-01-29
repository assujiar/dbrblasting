'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-700 border border-primary-200/50',
        secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200/50',
        accent: 'bg-accent-100 text-accent-700 border border-accent-200/50',
        success: 'bg-success-100 text-success-700 border border-success-200/50',
        warning: 'bg-warning-100 text-warning-700 border border-warning-200/50',
        error: 'bg-error-100 text-error-700 border border-error-200/50',
        outline: 'border border-neutral-300 text-neutral-700 bg-white/50',
        neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
