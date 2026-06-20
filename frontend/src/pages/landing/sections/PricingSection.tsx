import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PRICING_TIERS } from '@/lib/constants'
import Button from '@/components/Button'
import { cn } from '@/lib/utils'

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding border-t border-border">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-text-secondary max-w-lg mx-auto">
            No feature paywalls. No overage surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={tier.recommended ? { y: -6 } : { y: -3 }}
              className={cn(
                'relative rounded-2xl border p-7 flex flex-col gap-6',
                tier.recommended
                  ? 'gradient-border bg-surface-2 lg:scale-[1.04] z-10'
                  : 'border-border bg-surface-1'
              )}
              style={{
                boxShadow: tier.recommended ? 'var(--shadow-glow-accent)' : 'var(--shadow-card)',
              }}
            >
              {tier.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-accent-from to-accent-to px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-2">
                  {tier.price !== null ? (
                    <>
                      <span className="text-2xl font-semibold text-text-secondary">$</span>
                      <span className="text-5xl font-bold text-text-primary">{tier.price}</span>
                      {tier.period && (
                        <span className="text-sm text-text-tertiary">/{tier.period}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-text-primary">Custom</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{tier.description}</p>
              </div>

              {/* CTA */}
              <Link to={tier.ctaHref} className="block">
                <Button
                  variant={tier.recommended ? 'primary' : 'outline'}
                  size="md"
                  className="w-full justify-center"
                >
                  {tier.cta}
                </Button>
              </Link>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
