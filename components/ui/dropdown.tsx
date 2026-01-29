import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import clsx from 'classnames'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuItem = DropdownMenuPrimitive.Item
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator
export const DropdownMenuContent = ({ className, ...props }: any) => (
  <DropdownMenuPrimitive.Content
    className={clsx(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-1 shadow-lg backdrop-blur-sm',
      className
    )}
    sideOffset={4}
    {...props}
  />
)