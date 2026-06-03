import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/Button'
import { PLATFORM_LIST } from '@/lib/constants'

const features = [
  {
    title: 'One composer',
    description: 'Write once and publish to every platform simultaneously. No copy-pasting, no tab-switching.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    title: 'Connected accounts',
    description: 'Link Discord, X, Reddit, and LinkedIn. Manage everything from one clean dashboard.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    title: 'Post history',
    description: 'Track what you published, where, and when. Full audit trail across all your platforms.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-surface-2">
        <span className="font-bold text-base tracking-tight text-text-primary">
          Unified<span className="text-accent">.</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        {/* Platform pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-1 border border-surface-2 mb-8"
        >
          {PLATFORM_LIST.map((p) => (
            <div
              key={p.name}
              className="size-5 rounded-md flex items-center justify-center"
              style={{ color: p.color }}
            >
              <p.Icon className="size-3.5" />
            </div>
          ))}
          <span className="text-xs text-text-secondary ml-1">4 platforms supported</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.06 }}
          className="text-5xl sm:text-6xl font-bold tracking-tight text-text-primary leading-[1.1] max-w-2xl"
        >
          Post everywhere.{' '}
          <span className="text-accent">Once.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }}
          className="text-lg text-text-secondary mt-5 max-w-xl leading-relaxed"
        >
          Connect your social accounts and publish to Discord, X, Reddit, and LinkedIn
          from a single dashboard. Built for developers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.18 }}
          className="flex items-center gap-3 mt-8"
        >
          <Link to="/register">
            <Button variant="primary" size="lg">Start for free</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">Sign in</Button>
          </Link>
        </motion.div>
      </main>

      {/* Features */}
      <section className="px-8 py-16 border-t border-surface-2 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.08 * i }}
              className="bg-surface-1 border border-surface-2 rounded-xl p-5"
            >
              <div className="size-9 rounded-lg bg-accent-muted flex items-center justify-center text-accent mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-1.5">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-2 px-8 py-5 flex items-center justify-between">
        <span className="text-xs text-text-tertiary">
          Unified<span className="text-accent">.</span> — Social posting unified
        </span>
        <div className="flex gap-3">
          {PLATFORM_LIST.map((p) => (
            <div
              key={p.name}
              className="size-6 flex items-center justify-center"
              style={{ color: p.color, opacity: p.implemented ? 1 : 0.4 }}
              title={p.label}
            >
              <p.Icon className="size-4" />
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
