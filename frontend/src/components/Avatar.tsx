import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  email: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
}

export default function Avatar({ email, size = 'sm', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-violet-600 to-indigo-500',
        'flex items-center justify-center text-white font-semibold shrink-0',
        'ring-1 ring-white/10 transition-all duration-150 hover:ring-accent-light/30',
        sizeClasses[size],
        className
      )}
      aria-label={`Avatar for ${email}`}
    >
      {getInitials(email)}
    </div>
  )
}
