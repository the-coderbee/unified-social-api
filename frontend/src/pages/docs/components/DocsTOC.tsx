import { cn } from '@/lib/utils'
import type { DocAnchor } from '../config/docsConfig'

interface DocsTOCProps {
  anchors: DocAnchor[]
  activeId: string
}

export default function DocsTOC({ anchors, activeId }: DocsTOCProps) {
  if (anchors.length === 0) return null

  return (
    <nav className="sticky top-20 py-6" aria-label="Table of contents">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
        On this page
      </p>
      <ul className="flex flex-col gap-0.5">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <a
              href={`#${anchor.id}`}
              className={cn(
                'relative flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors',
                activeId === anchor.id
                  ? 'text-accent-light'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              {activeId === anchor.id && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent-light" />
              )}
              {anchor.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
