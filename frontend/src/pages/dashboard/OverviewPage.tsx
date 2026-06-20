import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layers, Key, ArrowRight, BookOpen, CheckCircle, Plus } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAccounts } from '@/features/accounts/hooks/useAccounts'
import { useApiKeys } from '@/features/api-keys/hooks/useApiKeys'
import { DASHBOARD_PLATFORMS } from '@/lib/constants'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <motion.div
      variants={item}
      className="rounded-xl border border-border bg-surface-1 p-5"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accent ?? 'rgba(124,58,237,0.1)' }}
        >
          <Icon className="w-4 h-4 text-accent-light" />
        </div>
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      {sub && <p className="mt-1 text-xs text-text-tertiary">{sub}</p>}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-20 rounded bg-surface-2" />
        <div className="w-8 h-8 rounded-lg bg-surface-2" />
      </div>
      <div className="h-7 w-14 rounded bg-surface-2" />
    </div>
  )
}

export default function OverviewPage() {
  const { user } = useAuth()
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: keys, isLoading: keysLoading } = useApiKeys()

  const totalPlatforms = DASHBOARD_PLATFORMS.length
  const connectedPlatforms = accounts?.length ?? 0
  const activeKeys = keys?.filter((k) => k.is_active).length ?? 0
  const statsLoading = accountsLoading || keysLoading

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const QUICK_ACTIONS = [
    {
      to: '/dashboard/platforms',
      icon: Layers,
      label: 'Connect a Platform',
      desc: 'Link X, Discord, Mastodon, or LinkedIn',
      color: 'rgba(99,102,241,0.1)',
    },
    {
      to: '/dashboard/api-keys',
      icon: Key,
      label: 'Create API Key',
      desc: 'Generate a scoped key for the API',
      color: 'rgba(245,158,11,0.1)',
    },
    {
      to: '/docs',
      icon: BookOpen,
      label: 'Read the Docs',
      desc: 'Endpoints, auth, and examples',
      color: 'rgba(34,197,94,0.1)',
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting()},{' '}
          <span className="gradient-text">
            {user?.email?.split('@')[0] ?? '…'}
          </span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your connected platforms and API keys.
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
      >
        {statsLoading ? (
          Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Platforms"
              value={`${connectedPlatforms} / ${totalPlatforms}`}
              icon={Layers}
              sub="connected accounts"
              accent="rgba(99,102,241,0.1)"
            />
            <StatCard
              label="API Keys"
              value={activeKeys}
              icon={Key}
              sub={activeKeys === 1 ? 'active key' : 'active keys'}
              accent="rgba(245,158,11,0.1)"
            />
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected platforms */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 rounded-xl border border-border bg-surface-1"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Your Platforms</h2>
            <Link
              to="/dashboard/platforms"
              className="flex items-center gap-1 text-xs text-accent-light hover:underline"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {accountsLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-2" />
                  <div className="h-3 w-28 rounded bg-surface-2" />
                  <div className="h-5 w-20 rounded-full bg-surface-2 ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {DASHBOARD_PLATFORMS.map((platform) => {
                const account = accounts?.find((a) => a.platform === platform.id)
                const isConnected = Boolean(account)
                return (
                  <li key={platform.id} className="px-5 py-4 flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: platform.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary">{platform.name}</p>
                      {isConnected && account && (
                        <p className="text-xs text-text-tertiary truncate">
                          @{account.username ?? account.global_name ?? account.provider_account_id}
                        </p>
                      )}
                    </div>
                    {isConnected ? (
                      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-2.5 py-1">
                        <CheckCircle className="w-3 h-3 text-success" />
                        <span className="text-xs font-medium text-success">Connected</span>
                      </span>
                    ) : (
                      <Link
                        to="/dashboard/platforms"
                        className="ml-auto flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-light transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Connect
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          <h2 className="text-sm font-semibold text-text-primary px-1">Quick Actions</h2>
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ y: -2, borderColor: 'rgba(124,58,237,0.25)' }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-4 cursor-pointer"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: color }}
                >
                  <Icon className="w-4 h-4 text-accent-light" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="text-xs text-text-tertiary">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-tertiary ml-auto shrink-0" />
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
