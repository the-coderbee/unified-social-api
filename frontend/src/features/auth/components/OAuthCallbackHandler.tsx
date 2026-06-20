import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOAuthCallback } from '../hooks/useAuth'

interface OAuthCallbackHandlerProps {
  provider: 'google' | 'github'
}

export default function OAuthCallbackHandler({ provider }: OAuthCallbackHandlerProps) {
  const [searchParams] = useSearchParams()
  const { mutate } = useOAuthCallback(provider)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code && state) {
      mutate({ code, state })
    }
  }, [mutate, searchParams])

  const providerLabel = provider === 'google' ? 'Google' : 'GitHub'

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-surface-0 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.05) 50%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-5 text-center"
      >
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin"
            style={{ borderTopColor: 'var(--color-accent)' }}
          />
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-from), var(--color-accent-to))',
              opacity: 0.15,
            }}
          />
        </div>

        <div>
          <p className="text-base font-semibold text-text-primary">
            Finishing sign in with {providerLabel}
          </p>
          <p className="mt-1 text-sm text-text-tertiary">Just a moment…</p>
        </div>
      </motion.div>
    </div>
  )
}
