import { useMemo } from 'react'
import { docsSections, type DocAnchor, type DocSection } from '../config/docsConfig'

export interface SearchResult {
  section: DocSection
  anchor: DocAnchor
}

export function useDocsSearch(query: string): SearchResult[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    return docsSections.flatMap((section) => {
      const sectionMatches = section.title.toLowerCase().includes(q) ||
        section.description.toLowerCase().includes(q)

      return section.anchors
        .filter((anchor) =>
          sectionMatches || anchor.label.toLowerCase().includes(q),
        )
        .map((anchor) => ({ section, anchor }))
    })
  }, [query])
}
