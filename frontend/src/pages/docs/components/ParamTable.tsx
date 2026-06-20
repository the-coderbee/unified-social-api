import type { DocParam } from '../config/docsConfig'

interface ParamTableProps {
  params: DocParam[]
}

const LOCATION_STYLES: Record<DocParam['location'], string> = {
  body: 'bg-violet-500/10 text-violet-400',
  path: 'bg-orange-500/10 text-orange-400',
  query: 'bg-blue-500/10 text-blue-400',
  header: 'bg-emerald-500/10 text-emerald-400',
}

export default function ParamTable({ params }: ParamTableProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-1">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Parameter
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              In
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Required
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((param, i) => (
            <tr
              key={param.name}
              className={i % 2 === 1 ? 'bg-surface-1/40' : 'bg-transparent'}
            >
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-accent-light">{param.name}</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-text-secondary">{param.type}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded px-1.5 py-0.5 font-mono text-xs ${LOCATION_STYLES[param.location]}`}
                >
                  {param.location}
                </span>
              </td>
              <td className="px-4 py-3">
                {param.required ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-400">Yes</span>
                  </span>
                ) : (
                  <span className="text-xs text-text-tertiary">No</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-text-secondary leading-relaxed">
                {param.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
