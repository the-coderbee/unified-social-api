import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, RefreshCw, Shield, RotateCcw, SlidersHorizontal, Key } from 'lucide-react'
import { FEATURES } from '@/lib/constants'

const iconMap = {
  Zap, RefreshCw, Shield, RotateCcw, SlidersHorizontal, Key,
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="section-padding border-t border-border">
      <div className="container-content">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Everything you need to ship faster
          </h2>
          <p className="mt-3 text-text-secondary max-w-lg mx-auto">
            A complete platform for modern social publishing pipelines.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap]
            return (
              <motion.div
                key={feature.id}
                variants={cardVariant}
                whileHover={{ borderColor: 'rgba(124,58,237,0.25)', backgroundColor: 'var(--color-surface-2)' }}
                transition={{ duration: 0.15 }}
                className="group rounded-xl border border-border bg-surface-1 p-6 cursor-default"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mb-4 transition-colors group-hover:bg-accent/15">
                  <Icon className="w-4.5 h-4.5 text-accent-light" style={{ width: '18px', height: '18px' }} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
