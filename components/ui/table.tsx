import * as React from 'react'

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className ?? ''}`}>
      <table className="min-w-full text-sm text-left">
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border bg-muted/50">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-dashed border-border last:border-0">{children}</tr>
}

export function TableCell({ children, header = false, className = '' }: { children: React.ReactNode; header?: boolean; className?: string }) {
  const Component = header ? 'th' : 'td'
  return (
    <Component
      className={`px-4 py-3 ${header ? 'font-semibold text-gray-700' : ''} ${className}`}
    >
      {children}
    </Component>
  )
}