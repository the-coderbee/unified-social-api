import { NavLink, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Shield, Send, Link, Key, User, AlertTriangle, Share2,
} from 'lucide-react'
import { docsSections, type DocSection } from '../config/docsConfig'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Shield,
  Send,
  Link,
  Key,
  User,
  AlertTriangle,
}

interface DocsSidebarProps {
  onNavigate?: () => void
}

export default function DocsSidebar({ onNavigate }: DocsSidebarProps) {
  const { section: activeSlug } = useParams<{ section: string }>()

  return (
    <nav className="flex flex-col h-full overflow-y-auto py-6 px-3">
      {/* Logo */}
      <NavLink
        to="/"
        className="flex items-center gap-2.5 px-3 mb-6 shrink-0"
        aria-label="Back to home"
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-from to-accent-to flex items-center justify-center shrink-0">
          <Share2 className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-semibold tracking-tight">
          <span className="gradient-text">Unified</span>
          <span className="text-text-secondary"> API</span>
        </span>
        <span className="ml-auto text-[10px] font-medium text-text-tertiary border border-border rounded px-1.5 py-0.5">
          Docs
        </span>
      </NavLink>

      {/* Sections */}
      <ul className="flex flex-col gap-0.5">
        {docsSections.map((section) => (
          <SectionItem
            key={section.slug}
            section={section}
            isActive={activeSlug === section.slug}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  )
}

function SectionItem({
  section,
  isActive,
  onNavigate,
}: {
  section: DocSection
  isActive: boolean
  onNavigate?: () => void
}) {
  const Icon = ICONS[section.icon] ?? BookOpen

  return (
    <li>
      <NavLink
        to={`/docs/${section.slug}`}
        onClick={onNavigate}
        className={cn(
          'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'text-text-primary bg-surface-2'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/60',
        )}
      >
        {isActive && (
          <motion.div
            layoutId="docs-sidebar-pill"
            className="absolute inset-0 rounded-lg bg-surface-2"
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        )}
        <span className="relative flex items-center gap-2.5">
          <Icon
            className={cn(
              'w-4 h-4 shrink-0 transition-colors',
              isActive ? 'text-accent-light' : 'text-text-tertiary',
            )}
          />
          <span className="font-medium">{section.title}</span>
        </span>
      </NavLink>

      {/* Anchors */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="overflow-hidden mt-0.5 ml-6 border-l border-border pl-3 flex flex-col gap-0.5"
          >
            {section.anchors.map((anchor, i) => (
              <motion.li
                key={anchor.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <a
                  href={`#${anchor.id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2 py-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors rounded px-2 hover:bg-surface-2/40"
                >
                  {anchor.type === 'endpoint' && (
                    <span className="w-1 h-1 rounded-full bg-accent-light/60 shrink-0" />
                  )}
                  {anchor.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
