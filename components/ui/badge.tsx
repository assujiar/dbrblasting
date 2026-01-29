import clsx from 'classnames'

export function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'destructive'; className?: string }) {
  let color
  switch (variant) {
    case 'secondary':
      color = 'bg-muted text-gray-700'
      break
    case 'destructive':
      color = 'bg-destructive text-destructive-foreground'
      break
    default:
      color = 'bg-accent text-accent-foreground'
      break
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
        color,
        className
      )}
    >
      {children}
    </span>
  )
}