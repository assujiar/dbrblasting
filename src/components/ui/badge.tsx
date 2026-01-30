'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-r from-primary-100 to-primary-50',
          'text-primary-700 border border-primary-200/60',
        ].join(' '),
        secondary: [
          'bg-gradient-to-r from-secondary-100 to-secondary-50',
          'text-secondary-700 border border-secondary-200/60',
        ].join(' '),
        accent: [
          'bg-gradient-to-r from-accent-100 to-accent-50',
          'text-accent-700 border border-accent-200/60',
        ].join(' '),
        success: [
          'bg-gradient-to-r from-success-100 to-success-50',
          'text-success-700 border border-success-200/60',
        ].join(' '),
        warning: [
          'bg-gradient-to-r from-warning-100 to-warning-50',
          'text-warning-600 border border-warning-200/60',
        ].join(' '),
        error: [
          'bg-gradient-to-r from-error-100 to-error-50',
          'text-error-700 border border-error-200/60',
        ].join(' '),
        outline: [
          'border border-neutral-200 bg-white/80 backdrop-blur-sm',
          'text-neutral-600',
        ].join(' '),
        neutral: [
          'bg-neutral-100/80 backdrop-blur-sm',
          'text-neutral-600 border border-neutral-200/60',
        ].join(' '),
        glass: [
          'bg-white/60 backdrop-blur-md',
          'text-neutral-700 border border-white/40',
          'shadow-sm',
        ].join(' '),
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
