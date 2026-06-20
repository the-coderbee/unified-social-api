import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import Button from '@/components/Button'

const stats = [
  { label: '4 Platforms' },
  { label: '< 200ms avg latency' },
  { label: '99.9% uptime' },
]

export default function CTASection() {
  return (
    <section className="relative border-t border-border overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.1) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
        }}
      />

      <div className="container-content relative py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight mb-4 text-balance">
            Ready to simplify your
            publishing workflow?
          </h2>
          <p className="text-lg text-text-secondary mb-10 text-balance">
            Join developers building with Unified Social API.
            One integration. Every platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link to="/register">
              <Button variant="primary" size="lg" className="gap-2">
                Get your API key <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="ghost" size="lg" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Read the docs
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-0">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                <span className="text-sm text-text-tertiary">{stat.label}</span>
                {i < stats.length - 1 && (
                  <span className="mx-4 sm:mx-6 text-border-active text-text-tertiary">·</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
