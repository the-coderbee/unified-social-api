import { cn } from '@/lib/utils'
import type { PlatformName } from '@/lib/constants'

interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'outline'
  platform?: PlatformName
  children: React.ReactNode
  className?: string
}

const variantMap = {
  default: 'bg-surface-2 text-text-secondary',
  success: 'bg-success/15 text-success',
  error: 'bg-error/15 text-error',
  warning: 'bg-warning/15 text-warning',
  outline: 'border border-surface-3 text-text-secondary',
}

const platformColorMap: Record<PlatformName, string> = {
  discord: 'bg-discord/15 text-discord',
  x: 'bg-x/10 text-x',
  reddit: 'bg-reddit/15 text-reddit',
  linkedin: 'bg-linkedin/15 text-linkedin',
}

export function Badge({ variant = 'default', platform, children, className }: BadgeProps) {
  const colorClass = platform ? platformColorMap[platform] : variantMap[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  )
}
