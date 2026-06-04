import { type ComponentPropsWithRef } from 'react'
import { cn } from '../../lib/cn'

export function Label({ className, ...props }: ComponentPropsWithRef<'label'>) {
  return (
    <label className={cn('mb-1.5 block text-sm leading-none font-medium', className)} {...props} />
  )
}
