import { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowUpRight, Hash } from 'lucide-react'
import { useDocsSearch } from '../hooks/useDocsSearch'

interface DocsSearchModalProps {
  open: boolean
  onClose: () => void
}

export default function DocsSearchModal({ open, onClose }: DocsSearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const results = useDocsSearch(query)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        const { section, anchor } = results[selectedIndex]
        navigate(`/docs/${section.slug}#${anchor.id}`)
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, results, selectedIndex, navigate, onClose])

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-border bg-surface-1 overflow-hidden"
              style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.15)' }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="w-4 h-4 text-text-tertiary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation…"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                />
                <kbd className="hidden sm:flex items-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-mono text-text-tertiary">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() === '' ? (
                  <div className="py-10 text-center">
                    <Search className="mx-auto w-6 h-6 text-text-tertiary mb-2" />
                    <p className="text-sm text-text-tertiary">Type to search the docs…</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-text-secondary">No results for "<span className="text-text-primary">{query}</span>"</p>
                  </div>
                ) : (
                  <ul className="py-2">
                    {results.map((result, i) => (
                      <li key={`${result.section.slug}-${result.anchor.id}`}>
                        <button
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            selectedIndex === i
                              ? 'bg-surface-2 text-text-primary'
                              : 'text-text-secondary hover:bg-surface-2/60'
                          }`}
                          onClick={() => {
                            navigate(`/docs/${result.section.slug}#${result.anchor.id}`)
                            onClose()
                          }}
                          onMouseEnter={() => setSelectedIndex(i)}
                        >
                          <Hash className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.anchor.label}</p>
                            <p className="text-xs text-text-tertiary">{result.section.title}</p>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary shrink-0 opacity-0 group-hover:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer hint */}
              <div className="border-t border-border px-4 py-2.5 flex items-center gap-4 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 font-mono text-[10px]">↑</kbd>
                  <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 font-mono text-[10px]">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 font-mono text-[10px]">ESC</kbd>
                  Close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modal, document.body)
}
