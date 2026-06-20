import { motion } from 'framer-motion'
import { ArrowRight, BookOpen } from 'lucide-react'
import Button from '@/components/Button'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const platforms = [
  {
    id: 'x',
    label: 'X',
    color: '#e7e9ea',
    delay: '0s',
    position: 'top-[15%] left-[8%]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.622 5.907-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    id: 'discord',
    label: 'Discord',
    color: '#5865f2',
    delay: '1s',
    position: 'top-[15%] right-[8%]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.127 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  {
    id: 'reddit',
    label: 'Reddit',
    color: '#ff4500',
    delay: '2s',
    position: 'bottom-[18%] left-[8%]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
      </svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: '#0a66c2',
    delay: '1.5s',
    position: 'bottom-[18%] right-[8%]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
]

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at 50% -10%, rgba(124,58,237,0.14) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)',
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" aria-hidden="true" />

      {/* Floating platform icons */}
      {platforms.map((p) => (
        <div
          key={p.id}
          className={`absolute hidden lg:flex ${p.position} animate-float`}
          style={{ animationDelay: p.delay }}
          aria-hidden="true"
        >
          <div
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-1 px-3.5 py-2.5 shadow-card"
            style={{ color: p.color }}
          >
            {p.icon}
            <span className="text-xs font-medium text-text-secondary">{p.label}</span>
          </div>
        </div>
      ))}

      <div className="container-content w-full py-24 lg:py-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-light">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse-glow shrink-0" />
              Unified Social API · v0.1
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-balance"
          >
            <span className="text-text-primary block">Post Once.</span>
            <span className="gradient-text block">Reach Everywhere.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={item}
            className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-xl text-balance"
          >
            One REST call. Four platforms. Zero glue code.
            Unified Social API handles concurrent publishing, token refresh, and retries — so you don't have to.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <Button variant="primary" size="lg" className="gap-2">
              Get your API key <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="lg" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Read the docs
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-text-tertiary"
          >
            {['MIT Licensed', 'FastAPI + asyncio', 'Open Source'].map((label) => (
              <span key={label} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-border-active" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Center API illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 mx-auto max-w-xl"
        >
          <div className="rounded-xl border border-border bg-surface-1 shadow-card overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs font-mono text-text-tertiary">POST /api/v1/posts/</span>
            </div>
            <div className="p-5 font-mono text-sm">
              <div className="text-text-tertiary">{`{`}</div>
              <div className="pl-4">
                <span className="text-blue-400">"content"</span>
                <span className="text-text-tertiary">: </span>
                <span className="text-green-400">"Just shipped v2 of our API 🚀"</span>
                <span className="text-text-tertiary">,</span>
              </div>
              <div className="pl-4">
                <span className="text-blue-400">"platforms"</span>
                <span className="text-text-tertiary">: [</span>
                <span className="text-amber-400">"discord"</span>
                <span className="text-text-tertiary">, </span>
                <span className="text-amber-400">"x"</span>
                <span className="text-text-tertiary">]</span>
              </div>
              <div className="text-text-tertiary">{`}`}</div>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-green-400">✓ </span>
                <span className="text-text-secondary">Published to </span>
                <span className="text-accent-light font-semibold">2 platforms</span>
                <span className="text-text-secondary"> concurrently</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
