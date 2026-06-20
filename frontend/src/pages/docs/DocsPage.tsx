import { Suspense, useEffect, useState } from 'react'
import { Outlet, Navigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Share2, ChevronRight, Home } from 'lucide-react'
import { docsSections } from './config/docsConfig'
import DocsSidebar from './components/DocsSidebar'
import DocsTOC from './components/DocsTOC'
import DocsSearchModal from './components/DocsSearchModal'
import { useScrollSpy } from './hooks/useScrollSpy'

function DocsSectionRenderer() {
  const { section: slug } = useParams<{ section: string }>()
  const sectionConfig = docsSections.find((s) => s.slug === slug)
  const anchorIds = sectionConfig?.anchors.map((a) => a.id) ?? []
  const activeId = useScrollSpy(anchorIds)

  if (!sectionConfig) {
    return <Navigate to="/docs/introduction" replace />
  }

  const { component: SectionComponent } = sectionConfig

  return (
    <>
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-6 py-10 pb-24">
          <Suspense fallback={<DocsSkeleton />}>
            <SectionComponent />
          </Suspense>
        </div>
      </main>

      {/* Right TOC */}
      <aside className="hidden xl:block w-56 shrink-0 px-4">
        <DocsTOC anchors={sectionConfig.anchors} activeId={activeId} />
      </aside>
    </>
  )
}

function DocsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-2">
      <div className="h-8 w-64 rounded-lg bg-surface-2" />
      <div className="h-4 w-full rounded bg-surface-2" />
      <div className="h-4 w-4/5 rounded bg-surface-2" />
      <div className="h-4 w-3/5 rounded bg-surface-2" />
      <div className="mt-8 h-40 rounded-xl bg-surface-2" />
      <div className="h-4 w-full rounded bg-surface-2" />
      <div className="h-4 w-5/6 rounded bg-surface-2" />
    </div>
  )
}

export default function DocsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { section: activeSlug } = useParams<{ section: string }>()
  const activeSection = docsSections.find((s) => s.slug === activeSlug)

  // Ctrl+K and / to open search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === '/' && document.activeElement === document.body) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Lock scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-surface-base text-text-primary flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border flex items-center bg-surface-base/90"
        style={{ backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center h-full w-full">
          {/* Left: logo area (matches sidebar width) */}
          <div className="hidden md:flex items-center w-60 shrink-0 px-4 border-r border-border h-full">
            <Link
              to="/"
              className="flex items-center gap-2 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-from to-accent-to flex items-center justify-center">
                <Share2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold">
                <span className="gradient-text">Unified</span>
                <span className="text-text-secondary"> API</span>
              </span>
            </Link>
          </div>

          {/* Mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3 px-4 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-text-tertiary hover:text-text-secondary rounded-lg hover:bg-surface-2 transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <span>Docs</span>
              {activeSection && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-text-secondary">{activeSection.title}</span>
                </>
              )}
            </div>
          </div>

          {/* Desktop breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 px-6 text-xs text-text-tertiary flex-1">
            <Link to="/" className="hover:text-text-secondary transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/docs" className="hover:text-text-secondary transition-colors">
              Docs
            </Link>
            {activeSection && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-text-secondary">{activeSection.title}</span>
              </>
            )}
          </div>

          {/* Search trigger */}
          <div className="ml-auto px-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs text-text-tertiary hover:text-text-secondary hover:border-border-active transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Search docs…</span>
              <kbd className="hidden sm:block rounded border border-border bg-surface-2 px-1 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 pt-14">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border fixed top-14 bottom-0 overflow-y-auto bg-surface-base">
          <DocsSidebar />
        </aside>

        {/* Content area (offset for sidebar) */}
        <div className="flex flex-1 md:ml-60 min-h-[calc(100vh-56px)]">
          <Outlet />
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed top-0 left-0 bottom-0 z-[101] w-72 bg-surface-base border-r border-border md:hidden"
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-border">
                <span className="text-sm font-semibold text-text-primary">Documentation</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-secondary rounded-lg hover:bg-surface-2 transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <DocsSidebar onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Search modal */}
      <DocsSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

export { DocsSectionRenderer }
