import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { docsSections } from '../config/docsConfig'

interface DocsPagerProps {
  currentSlug: string
}

export default function DocsPager({ currentSlug }: DocsPagerProps) {
  const idx = docsSections.findIndex((s) => s.slug === currentSlug)
  const prev = idx > 0 ? docsSections[idx - 1] : null
  const next = idx < docsSections.length - 1 ? docsSections[idx + 1] : null

  return (
    <div className="mt-16 pt-8 border-t border-border flex items-center justify-between gap-4">
      {prev ? (
        <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Link
            to={`/docs/${prev.slug}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 px-5 py-4 text-left hover:border-border-active transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-text-tertiary shrink-0" />
            <div>
              <p className="text-xs text-text-tertiary mb-0.5">Previous</p>
              <p className="text-sm font-medium text-text-primary">{prev.title}</p>
            </div>
          </Link>
        </motion.div>
      ) : (
        <div />
      )}

      {next ? (
        <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Link
            to={`/docs/${next.slug}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 px-5 py-4 text-right hover:border-border-active transition-colors"
          >
            <div>
              <p className="text-xs text-text-tertiary mb-0.5">Next</p>
              <p className="text-sm font-medium text-text-primary">{next.title}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
          </Link>
        </motion.div>
      ) : (
        <div />
      )}
    </div>
  )
}
