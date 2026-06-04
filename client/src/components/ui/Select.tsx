import { type ComponentPropsWithRef } from 'react'
import { cn } from '../../lib/cn'

export function Select({ className, children, ...props }: ComponentPropsWithRef<'select'>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
