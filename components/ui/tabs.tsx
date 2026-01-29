import * as TabsPrimitive from '@radix-ui/react-tabs'
import clsx from 'classnames'

export const Tabs = TabsPrimitive.Root
export const TabsList = TabsPrimitive.List
export const TabsTrigger = TabsPrimitive.Trigger
export const TabsContent = TabsPrimitive.Content

// Provide default classes via wrappers
export function StyledTabsList({ className, ...props }: any) {
  return (
    <TabsList
      className={clsx('inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}
      {...props}
    />
  )
}

export function StyledTabsTrigger({ className, ...props }: any) {
  return (
    <TabsTrigger
      className={clsx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-gray-900',
        className
      )}
      {...props}
    />
  )
}

export function StyledTabsContent({ className, ...props }: any) {
  return (
    <TabsContent
      className={clsx('mt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
}