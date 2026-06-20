import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLinkAccount } from '../hooks/useAccounts'

export default function SocialCallbackHandler() {
  const { platform = '' } = useParams<{ platform: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  // Navigation lives in the hook-level callbacks so it survives StrictMode's
  // mount→unmount→mount cycle (per-call mutate() callbacks would be dropped).
  const { mutate } = useLinkAccount({
    onSuccess: () => navigate('/dashboard/platforms'),
    onError: () => navigate('/dashboard/platforms?error=link_failed'),
  })
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const platformInstance =
      searchParams.get('platform_instance') ??
      sessionStorage.getItem(`social_platform_instance_${platform}`) ??
      undefined
    sessionStorage.removeItem(`social_platform_instance_${platform}`)

    if (code && state && platform) {
      mutate({ platform, code, state, platformInstance })
    } else {
      navigate('/dashboard/platforms?error=link_failed')
    }
  }, [mutate, navigate, platform, searchParams])

  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1)

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-surface-0 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.1) 0%, transparent 70%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-5 text-center"
      >
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: 'var(--color-accent)' }}
          />
        </div>
        <div>
          <p className="text-base font-semibold text-text-primary">
            Connecting {platformLabel}…
          </p>
          <p className="mt-1 text-sm text-text-tertiary">Just a moment</p>
        </div>
      </motion.div>
    </div>
  )
}
