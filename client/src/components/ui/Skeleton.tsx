import { type ComponentPropsWithRef } from 'react'
import { cn } from '../../lib/cn'

export function Skeleton({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}
