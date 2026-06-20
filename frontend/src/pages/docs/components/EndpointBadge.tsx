import { cn } from '@/lib/utils'
import type { HttpMethod } from '../config/docsConfig'

interface EndpointBadgeProps {
  method: HttpMethod
  path: string
  className?: string
}

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  PATCH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

export default function EndpointBadge({ method, path, className }: EndpointBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-surface-1 px-4 py-2.5 font-mono text-sm',
        className,
      )}
    >
      <span
        className={cn(
          'shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide uppercase',
          METHOD_STYLES[method],
        )}
      >
        {method}
      </span>
      <span className="text-text-secondary truncate">{path}</span>
    </div>
  )
}
