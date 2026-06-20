import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, RotateCcw, ExternalLink, AlertTriangle } from 'lucide-react'
import { usePosts, useRetryPost } from '@/features/posts/hooks/usePosts'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import type { PostResponse, PostStatus } from '@/types/api'
import { formatDate } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const STATUS_TABS: { label: string; value: PostStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Partial', value: 'PARTIAL_SUCCESS' },
  { label: 'Failed', value: 'FAILED' },
]

const STATUS_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  SUCCESS: 'success',
  PARTIAL_SUCCESS: 'partial',
  FAILED: 'failed',
  PENDING: 'pending',
}

const PLATFORM_COLORS: Record<string, string> = {
  x: '#e7e9ea',
  discord: '#5865f2',
  mastodon: '#6364ff',
  linkedin: '#0a66c2',
}

function SkeletonRow() {
  return (
    <div className="px-5 py-4 animate-pulse flex items-start gap-4">
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3.5 w-3/4 rounded bg-surface-2" />
        <div className="h-2.5 w-1/2 rounded bg-surface-2" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-5 w-20 rounded-full bg-surface-2" />
        <div className="h-4 w-24 rounded bg-surface-2" />
      </div>
    </div>
  )
}

function PostRow({ post }: { post: PostResponse }) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: retry, isPending: retrying } = useRetryPost()

  return (
    <motion.li layout="position" className="border-b border-border last:border-0">
      {/* Summary row */}
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-surface-2/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary leading-snug line-clamp-2">
            {post.content}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {post.results.map((r) => (
              <span
                key={r.platform_name}
                className="inline-flex items-center gap-1 text-xs text-text-tertiary capitalize"
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: PLATFORM_COLORS[r.platform_name] ?? '#525252' }}
                />
                {r.platform_name}
              </span>
            ))}
            <span className="text-xs text-text-tertiary">·</span>
            <span className="text-xs text-text-tertiary">{formatDate(post.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          <Badge variant={STATUS_BADGE[post.status] ?? 'pending'} />
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-text-tertiary" />
          </motion.div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-border bg-surface-0">
              {/* Full content */}
              <p className="text-sm text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Per-platform results */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wide">Platform</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wide">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {post.results.map((r) => (
                      <tr key={r.platform_name}>
                        <td className="px-4 py-3 capitalize font-medium text-text-primary">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: PLATFORM_COLORS[r.platform_name] ?? '#525252' }}
                            />
                            {r.platform_name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={r.status === 'SUCCESS' ? 'success' : 'failed'} />
                        </td>
                        <td className="px-4 py-3 text-text-tertiary">
                          {r.post_url ? (
                            <a
                              href={r.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-accent-light hover:underline text-xs"
                            >
                              View post <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : r.error_message ? (
                            <span className="text-xs text-error flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {r.error_message}
                            </span>
                          ) : (
                            <span className="text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {post.not_connected_platforms.map((p) => (
                      <tr key={p} className="opacity-50">
                        <td className="px-4 py-3 capitalize font-medium text-text-primary">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-border-active" />
                            {p}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-tertiary">Not connected</td>
                        <td className="px-4 py-3 text-xs text-text-tertiary">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Retry for failed */}
              {post.status === 'FAILED' && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => { e.stopPropagation(); retry(post.id) }}
                    disabled={retrying}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {retrying ? 'Retrying…' : 'Retry Post'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

export default function PostsPage() {
  const [activeStatus, setActiveStatus] = useState<PostStatus | undefined>(undefined)
  const { data: posts, isLoading } = usePosts(activeStatus)
  const { data: allPosts } = usePosts()

  const countByStatus = (status: PostStatus) =>
    allPosts?.filter((p) => p.status === status).length ?? 0

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-text-primary">Posts</h1>
        <p className="mt-1 text-sm text-text-secondary">Your full publishing history across all platforms.</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 bg-surface-1 border border-border rounded-lg p-1 w-fit">
        {STATUS_TABS.map(({ label, value }) => {
          const isActive = activeStatus === value
          const count = value ? countByStatus(value) : (allPosts?.length ?? 0)
          return (
            <button
              key={label}
              onClick={() => setActiveStatus(value)}
              className={[
                'relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5',
                isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
              ].join(' ')}
            >
              {isActive && (
                <motion.div
                  layoutId="posts-tab-indicator"
                  className="absolute inset-0 rounded-md bg-surface-2"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative">{label}</span>
              {count > 0 && (
                <span className="relative text-xs text-text-tertiary bg-surface-2 rounded-full px-1.5 py-0.5 leading-none">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Posts list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-border bg-surface-1 overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {isLoading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </ul>
        ) : !posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <FileText className="w-10 h-10 text-text-tertiary mb-3" />
            <p className="text-base font-semibold text-text-secondary">No posts found</p>
            <p className="mt-1 text-sm text-text-tertiary">
              {activeStatus
                ? `No ${activeStatus.toLowerCase().replace('_', ' ')} posts.`
                : 'Use the API to publish your first post.'}
            </p>
          </div>
        ) : (
          <motion.ul layout>
            {[...posts].reverse().map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </motion.ul>
        )}
      </motion.div>
    </div>
  )
}
