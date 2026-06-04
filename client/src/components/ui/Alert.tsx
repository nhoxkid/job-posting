import { type ComponentPropsWithRef } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'default' | 'destructive'

const variantClasses: Record<Variant, string> = {
  default: 'bg-card text-card-foreground border-border',
  destructive: 'border-destructive/50 text-destructive',
}

export interface AlertProps extends ComponentPropsWithRef<'div'> {
  variant?: Variant
}

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-lg border p-4 text-sm', variantClasses[variant], className)}
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }: ComponentPropsWithRef<'h5'>) {
  return <h5 className={cn('mb-1 font-medium', className)} {...props} />
}

export function AlertDescription({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('text-sm opacity-90', className)} {...props} />
}
