import { cn } from '@/lib/utils'

type BadgeVariant = 'available' | 'coming_soon' | 'success' | 'failed' | 'pending' | 'partial'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  available:    'bg-green-500/10 text-green-400 border border-green-500/20',
  coming_soon:  'bg-surface-2 text-text-tertiary border border-border',
  success:      'bg-green-500/10 text-green-400',
  failed:       'bg-red-500/10 text-red-400',
  pending:      'bg-amber-500/10 text-amber-400',
  partial:      'bg-blue-500/10 text-blue-400',
}

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium uppercase tracking-wider',
        variantClasses[variant],
        className
      )}
    >
      {(variant === 'available') && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
      )}
      {children}
    </span>
  )
}
