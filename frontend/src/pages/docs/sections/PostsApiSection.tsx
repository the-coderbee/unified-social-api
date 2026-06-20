import { motion } from 'framer-motion'
import { postsEndpoints } from '../config/docsConfig'
import EndpointBadge from '../components/EndpointBadge'
import CodeBlock from '../components/CodeBlock'
import ParamTable from '../components/ParamTable'
import StatusTable from '../components/StatusTable'
import DocsPager from '../components/DocsPager'

const EASE = [0.16, 1, 0.3, 1] as const

const STATUS_VALUES = [
  { value: 'success', color: 'text-emerald-400', desc: 'All requested platforms received the post.' },
  { value: 'partial_success', color: 'text-amber-400', desc: 'Some platforms succeeded, others failed.' },
  { value: 'failed', color: 'text-red-400', desc: 'All platforms failed. Retry is available.' },
]

export default function PostsApiSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3" id="posts">
          Posts API
        </h1>
        <p className="text-text-secondary leading-relaxed mb-6">
          The Posts API lets you publish content to multiple platforms in a single request. All
          platforms are called concurrently — no serialization, no waiting. Each result includes a
          per-platform status and a direct URL to the published post.
        </p>

        <div className="rounded-xl border border-border bg-surface-1 overflow-hidden mb-6">
          <div className="border-b border-border px-4 py-2.5 bg-surface-2/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Post Status Values</p>
          </div>
          <div className="divide-y divide-border">
            {STATUS_VALUES.map(({ value, color, desc }) => (
              <div key={value} className="flex items-start gap-4 px-4 py-3">
                <span className={`shrink-0 font-mono text-xs font-semibold pt-0.5 ${color}`}>{value}</span>
                <span className="text-sm text-text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-sm text-blue-400/80 leading-relaxed">
            <strong className="text-blue-400">Tip:</strong> Platforms listed in{' '}
            <code className="text-xs font-mono">not_connected_platforms</code> were skipped because you
            haven't linked them yet — they don't count as failures.
          </p>
        </div>
      </div>

      {postsEndpoints.map((ep, i) => (
        <motion.section
          key={ep.id}
          id={ep.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
          className="mb-14 scroll-mt-24"
        >
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <h2 className="text-xl font-semibold text-text-primary">{ep.title}</h2>
            {ep.authRequired && (
              <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                Auth required
              </span>
            )}
          </div>
          <EndpointBadge method={ep.method} path={ep.path} className="mb-4" />
          <p className="text-sm text-text-secondary leading-relaxed mb-6">{ep.description}</p>

          {ep.params && ep.params.length > 0 && <ParamTable params={ep.params} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ep.requestExample && (
              <CodeBlock code={ep.requestExample} language="json" title="Request body" />
            )}
            {ep.responseExample && (
              <CodeBlock code={ep.responseExample} language="json" title="Response" />
            )}
          </div>

          <StatusTable codes={ep.statusCodes} />
        </motion.section>
      ))}

      <DocsPager currentSlug="posts" />
    </motion.div>
  )
}
