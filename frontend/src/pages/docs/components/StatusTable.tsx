import type { DocStatusCode } from '../config/docsConfig'

interface StatusTableProps {
  codes: DocStatusCode[]
}

function getCodeStyle(code: number) {
  if (code >= 200 && code < 300) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (code >= 400 && code < 500) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  if (code >= 500) return 'bg-red-500/10 text-red-400 border-red-500/20'
  return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
}

export default function StatusTable({ codes }: StatusTableProps) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
        Response Codes
      </p>
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {codes.map((item) => (
          <div key={item.code} className="flex items-start gap-4 px-4 py-3 bg-surface-1/20">
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${getCodeStyle(item.code)}`}
            >
              {item.code}
            </span>
            <span className="text-sm text-text-secondary leading-relaxed">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
