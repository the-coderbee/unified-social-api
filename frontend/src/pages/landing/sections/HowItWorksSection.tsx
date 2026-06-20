import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link, FileText, Send } from 'lucide-react'
import { HOW_IT_WORKS } from '@/lib/constants'

const iconMap = { Link, FileText, Send }

export default function HowItWorksSection() {
  const lineRef = useRef(null)
  const isLineInView = useInView(lineRef, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="section-padding border-t border-border">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            From zero to published in three steps
          </h2>
          <p className="mt-3 text-text-secondary max-w-lg mx-auto">
            No SDK required. Just HTTP.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-[22px] left-[calc(16.6%-8px)] right-[calc(16.6%-8px)] h-px bg-border">
            <motion.div
              ref={lineRef}
              initial={{ scaleX: 0 }}
              animate={isLineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ transformOrigin: 'left' }}
              className="absolute inset-0 bg-gradient-to-r from-accent-from to-accent-to"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap]
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left"
                >
                  {/* Step number + icon */}
                  <div className="relative mb-6">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-glow-accent">
                      {step.step}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center">
                      <Icon className="w-2.5 h-2.5 text-accent-light" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-sm">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
