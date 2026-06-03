import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-1 border border-surface-2 rounded-xl shadow-sm shadow-black/20',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
