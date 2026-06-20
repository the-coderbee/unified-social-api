import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, CheckCircle, Clock } from 'lucide-react'
import { useAccounts, useUnlinkAccount } from '@/features/accounts/hooks/useAccounts'
import { getSocialLoginUrl } from '@/features/accounts/api/accountsApi'
import Button from '@/components/Button'
import { DASHBOARD_PLATFORMS, MASTODON_INSTANCES } from '@/lib/constants'
import type { SocialAccountResponse } from '@/types/api'
import { formatDate } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.622 5.907-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.127 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  ),
  mastodon: (
    <svg viewBox="0 0 74 79" fill="currentColor" className="w-6 h-6" aria-hidden="true">
      <path d="M73.7014 17.4323C72.5616 9.05152 65.1774 2.4469 56.424 1.1671C54.9472 0.950843 49.3518 0.163818 36.3901 0.163818H36.2933C23.3281 0.163818 20.5465 0.950843 19.0697 1.1671C10.56 2.41145 2.78877 8.34604 0.903306 16.826C0.00980824 21.0025 -0.0618445 25.6124 0.083703 29.8416C0.294724 35.9826 0.345261 42.1168 0.925195 48.2286C1.32545 52.3467 2.01966 56.4272 3.00004 60.4449C4.68037 67.0867 11.9191 72.8309 19.0697 75.3622C26.7352 78.0021 34.7913 78.528 42.8469 76.9987C43.7227 76.8309 44.5941 76.6371 45.4609 76.4184C47.4604 75.9135 49.5933 75.3235 51.3455 74.1762C51.3703 74.1605 51.3915 74.1398 51.4076 74.1157C51.4237 74.0916 51.4343 74.0645 51.4388 74.0362V68.1928C51.4386 68.1633 51.4313 68.1342 51.4174 68.1078C51.4036 68.0815 51.3836 68.0585 51.3591 68.0407C51.3346 68.0229 51.3063 68.0108 51.2763 68.0053C51.2463 67.9998 51.2155 68.0011 51.1861 68.009C44.6218 69.5765 37.8956 70.3516 31.1486 70.3197C19.8432 70.3197 16.9056 64.8076 16.1124 62.7147C15.4854 60.9599 15.0963 59.1271 14.9543 57.2681C14.9539 57.2378 14.9604 57.2078 14.9733 57.1803C14.9862 57.1528 15.0051 57.1285 15.0287 57.1093C15.0522 57.0901 15.0797 57.0765 15.109 57.0695C15.1383 57.0625 15.1688 57.0622 15.1983 57.0688C21.6831 58.6291 28.3435 59.4143 35.0291 59.4016C36.5081 59.4016 37.9852 59.4016 39.4623 59.3638C46.1832 59.1656 53.2652 58.7114 59.8654 57.3622C60.0309 57.3284 60.1965 57.2966 60.3519 57.2528C70.4218 55.0023 79.9981 48.6408 79.9981 32.9996V32.4155C79.9981 27.2268 78.2295 22.8792 74.7465 19.5887C74.5029 19.361 74.1078 18.7709 73.7014 17.4323ZM63.3576 53.1961H53.3156V30.7047C53.3156 25.5065 51.3411 22.8535 47.3371 22.8535C42.9454 22.8535 40.7455 25.8516 40.7455 31.7836V44.6899H30.7661V31.7836C30.7661 25.8516 28.5622 22.8535 24.1705 22.8535C20.1905 22.8535 18.1969 25.5065 18.1969 30.7047V53.1961H8.15701V30.0257C8.15701 24.8275 9.50342 20.7149 12.2001 17.6978C14.9897 14.6808 18.6446 13.1279 23.1847 13.1279C28.4188 13.1279 32.3715 15.0905 35.0007 19.0196L37.4818 23.0693L39.9669 19.0196C42.5966 15.0905 46.5492 13.1279 51.7838 13.1279C56.3196 13.1279 59.9746 14.6808 62.7681 17.6978C65.4647 20.7149 66.8112 24.8275 66.8112 30.0257V53.1961H63.3576Z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
}

interface PlatformCardProps {
  platform: (typeof DASHBOARD_PLATFORMS)[number]
  // Set for Mastodon cards — each federated instance renders as its own card.
  instance?: string
  account?: SocialAccountResponse
}

function PlatformCard({ platform, instance, account }: PlatformCardProps) {
  const [confirmUnlink, setConfirmUnlink] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const { mutate: unlink, isPending: unlinking } = useUnlinkAccount()
  const isConnected = Boolean(account)
  const isMastodon = Boolean(instance)

  async function handleConnect() {
    setConnecting(true)
    try {
      if (instance) {
        sessionStorage.setItem(`social_platform_instance_${platform.id}`, instance)
      }
      const { auth_url, state } = await getSocialLoginUrl(platform.id, instance)
      sessionStorage.setItem(`social_state_${platform.id}`, state)
      window.location.href = auth_url
    } catch {
      setConnecting(false)
    }
  }

  function handleUnlink() {
    unlink(
      { platform: platform.id, platformInstance: instance },
      { onSuccess: () => setConfirmUnlink(false) }
    )
  }

  return (
    <motion.div
      whileHover={isConnected ? { y: -2 } : {}}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-border bg-surface-1 p-5"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Platform header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${platform.color}15`, color: platform.color }}
          >
            {PLATFORM_ICONS[platform.id]}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{platform.name}</h3>
            {isMastodon && (
              <p className="text-xs text-text-tertiary mt-0.5 font-mono">{instance}</p>
            )}
            {isConnected && account && (
              <p className="text-xs text-text-tertiary mt-0.5">
                @{account.username ?? account.global_name ?? account.provider_account_id}
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-2.5 py-1">
            <CheckCircle className="w-3 h-3 text-success" />
            <span className="text-xs font-medium text-success">Connected</span>
          </div>
        ) : !platform.available ? (
          <div className="flex items-center gap-1.5 rounded-full bg-surface-2 border border-border px-2.5 py-1">
            <Clock className="w-3 h-3 text-text-tertiary" />
            <span className="text-xs font-medium text-text-tertiary">Coming Soon</span>
          </div>
        ) : null}
      </div>

      {/* Connected info */}
      {isConnected && account && (
        <p className="text-xs text-text-tertiary mb-4">
          Connected {formatDate(account.created_at)}
        </p>
      )}

      {/* Action */}
      {isConnected ? (
        <AnimatePresence mode="wait">
          {confirmUnlink ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-text-secondary flex-1">Disconnect {platform.name}?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmUnlink(false)}
                className="text-xs px-2.5"
              >
                Cancel
              </Button>
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/15 transition-colors disabled:opacity-50"
              >
                {unlinking ? 'Disconnecting…' : 'Confirm'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-text-tertiary hover:text-error w-full justify-center"
                onClick={() => setConfirmUnlink(true)}
              >
                Disconnect
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      ) : platform.available ? (
        <div className="flex flex-col gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Connecting…
              </>
            ) : (
              `Connect ${platform.name.split(' ')[0]}`
            )}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-text-tertiary text-center py-1">
          Available in a future release
        </p>
      )}
    </motion.div>
  )
}

export default function PlatformsPage() {
  const { data: accounts, isLoading, isError, refetch } = useAccounts()
  const [searchParams, setSearchParams] = useSearchParams()
  const hasError = searchParams.get('error') === 'link_failed'

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-text-primary">Platforms</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Connect your social accounts to start publishing.
        </p>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 flex items-center gap-3 rounded-lg border border-error/20 bg-error/8 px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span className="text-sm text-error flex-1">
              Failed to connect the platform. Please try again.
            </span>
            <button
              onClick={() => setSearchParams({})}
              className="text-error/60 hover:text-error transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface-1 p-5 animate-pulse h-36" />
          ))
        ) : isError ? (
          <div className="col-span-full flex flex-col items-center gap-4 py-14 text-center">
            <AlertCircle className="w-8 h-8 text-error/70" />
            <div>
              <p className="text-sm font-medium text-text-primary">Failed to load platforms</p>
              <p className="mt-1 text-xs text-text-tertiary">Check your connection and try again.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          DASHBOARD_PLATFORMS.flatMap((platform) => {
            // Mastodon is federated — render one card per supported instance.
            const instances: (string | undefined)[] =
              platform.id === 'mastodon' ? MASTODON_INSTANCES.map((i) => i.domain) : [undefined]
            return instances.map((instance) => {
              const account = accounts?.find(
                (a) => a.platform === platform.id && (!instance || a.platform_instance === instance)
              )
              return (
                <PlatformCard
                  key={`${platform.id}:${instance ?? ''}`}
                  platform={platform}
                  instance={instance}
                  account={account}
                />
              )
            })
          })
        )}
      </motion.div>

      {/* Info note */}
      <p className="mt-6 text-xs text-text-tertiary text-center">
        Platform tokens refresh automatically — once connected, your credentials stay valid.
      </p>
    </div>
  )
}
