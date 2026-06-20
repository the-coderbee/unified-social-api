import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Layers, Key, ArrowRight, Zap, TrendingUp } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePosts } from '@/features/posts/hooks/usePosts'
import { useAccounts } from '@/features/accounts/hooks/useAccounts'
import { useApiKeys } from '@/features/api-keys/hooks/useApiKeys'
import Badge from '@/components/Badge'
import { formatDate } from '@/lib/utils'

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

const STATUS_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  SUCCESS: 'success',
  PARTIAL_SUCCESS: 'partial',
  FAILED: 'failed',
  PENDING: 'pending',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return formatDate(iso)
}

export default function OverviewPage() {
  const { user } = useAuth()
  const { data: posts, isLoading: postsLoading } = usePosts()
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: keys, isLoading: keysLoading } = useApiKeys()

  const total = posts?.length ?? 0
  const succeeded = posts?.filter((p) => p.status === 'SUCCESS' || p.status === 'PARTIAL_SUCCESS').length ?? 0
  const successRate = total > 0 ? Math.round((succeeded / total) * 100) : 0
  const connectedPlatforms = accounts?.length ?? 0
  const activeKeys = keys?.filter((k) => k.is_active).length ?? 0
  const recentPosts = [...(posts ?? [])].reverse().slice(0, 5)

  const statsLoading = postsLoading || accountsLoading || keysLoading

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

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
          Here's what's happening with your publishing pipeline.
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Posts" value={total} icon={FileText} sub={`${succeeded} successful`} />
            <StatCard
              label="Success Rate"
              value={`${successRate}%`}
              icon={TrendingUp}
              sub={total > 0 ? `${total} posts total` : 'No posts yet'}
              accent="rgba(34,197,94,0.1)"
            />
            <StatCard
              label="Platforms"
              value={`${connectedPlatforms} / 4`}
              icon={Layers}
              sub="connected accounts"
              accent="rgba(99,102,241,0.1)"
            />
            <StatCard
              label="API Keys"
              value={activeKeys}
              icon={Key}
              sub="active keys"
              accent="rgba(245,158,11,0.1)"
            />
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent posts */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 rounded-xl border border-border bg-surface-1"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Recent Posts</h2>
            <Link
              to="/dashboard/posts"
              className="flex items-center gap-1 text-xs text-accent-light hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {postsLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-surface-2" />
                    <div className="h-2.5 w-1/3 rounded bg-surface-2" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-surface-2" />
                </div>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <FileText className="w-8 h-8 text-text-tertiary mb-3" />
              <p className="text-sm font-medium text-text-secondary">No posts yet</p>
              <p className="mt-1 text-xs text-text-tertiary">Your published posts will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentPosts.map((post) => (
                <li key={post.id} className="px-5 py-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate leading-snug">
                      {post.content.slice(0, 72)}{post.content.length > 72 ? '…' : ''}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {post.results.map((r) => (
                        <span
                          key={r.platform_name}
                          className="text-xs text-text-tertiary capitalize"
                        >
                          {r.platform_name}
                        </span>
                      ))}
                      <span className="text-xs text-text-tertiary">·</span>
                      <span className="text-xs text-text-tertiary">{relativeTime(post.created_at)}</span>
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE[post.status] ?? 'pending'} />
                </li>
              ))}
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
          {[
            {
              to: '/dashboard/platforms',
              icon: Layers,
              label: 'Connect a Platform',
              desc: 'Link X, Discord, and more',
              color: 'rgba(99,102,241,0.1)',
            },
            {
              to: '/dashboard/api-keys',
              icon: Key,
              label: 'Create API Key',
              desc: 'Generate a scoped API key',
              color: 'rgba(245,158,11,0.1)',
            },
            {
              to: '/dashboard/posts',
              icon: Zap,
              label: 'View Posts',
              desc: 'Browse your publishing history',
              color: 'rgba(34,197,94,0.1)',
            },
          ].map(({ to, icon: Icon, label, desc, color }) => (
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
