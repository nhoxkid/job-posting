import { type ComponentPropsWithRef } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'default' | 'secondary' | 'outline' | 'destructive'

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground border-transparent',
  secondary: 'bg-secondary text-secondary-foreground border-transparent',
  outline: 'text-foreground border-border',
  destructive: 'bg-destructive text-destructive-foreground border-transparent',
}

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  variant?: Variant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
