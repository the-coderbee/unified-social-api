import { motion } from 'framer-motion'
import { apiKeysEndpoints } from '../config/docsConfig'
import EndpointBadge from '../components/EndpointBadge'
import CodeBlock from '../components/CodeBlock'
import ParamTable from '../components/ParamTable'
import StatusTable from '../components/StatusTable'
import DocsPager from '../components/DocsPager'

const EASE = [0.16, 1, 0.3, 1] as const

const SCOPES = [
  { value: 'posts:write', desc: 'Create and publish posts to social platforms.' },
  { value: 'posts:read', desc: 'List and read post history and results.' },
  { value: 'platforms:read', desc: 'View connected social account information.' },
  { value: 'keys:read', desc: 'List API key metadata (not values).' },
]

export default function ApiKeysSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3" id="api-keys">
          API Keys
        </h1>
        <p className="text-text-secondary leading-relaxed mb-6">
          API keys enable server-to-server integrations without user sessions. Each key is scoped to
          specific permissions and can be revoked instantly. The full key value is shown only once at
          creation — store it securely.
        </p>

        <div className="rounded-xl border border-border overflow-hidden mb-4">
          <div className="border-b border-border px-4 py-2.5 bg-surface-2/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Available Scopes</p>
          </div>
          <div className="divide-y divide-border">
            {SCOPES.map(({ value, desc }) => (
              <div key={value} className="flex items-start gap-4 px-4 py-3">
                <code className="shrink-0 font-mono text-xs text-violet-400 pt-0.5 min-w-[140px]">
                  {value}
                </code>
                <span className="text-sm text-text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-400/80 leading-relaxed">
            <strong className="text-red-400">Security:</strong> API key values are hashed in the database
            and cannot be recovered. If a key is lost, revoke it and create a new one. Rate limit is{' '}
            <strong className="text-red-400">20 requests / 60 seconds</strong>.
          </p>
        </div>
      </div>

      {apiKeysEndpoints.map((ep, i) => (
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

      <DocsPager currentSlug="api-keys" />
    </motion.div>
  )
}
