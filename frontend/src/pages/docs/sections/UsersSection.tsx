import { motion } from 'framer-motion'
import { usersEndpoints } from '../config/docsConfig'
import EndpointBadge from '../components/EndpointBadge'
import CodeBlock from '../components/CodeBlock'
import StatusTable from '../components/StatusTable'
import DocsPager from '../components/DocsPager'

const EASE = [0.16, 1, 0.3, 1] as const

const AUTH_PROVIDERS = [
  { value: 'local', desc: 'Email and password registration.' },
  { value: 'google', desc: 'Signed in via Google OAuth2.' },
  { value: 'github', desc: 'Signed in via GitHub OAuth2.' },
]

export default function UsersSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3" id="users">
          Users
        </h1>
        <p className="text-text-secondary leading-relaxed mb-6">
          The Users API exposes the authenticated user's profile, including their linked social
          accounts and auth provider. Use <code className="text-xs font-mono bg-surface-2 rounded px-1 py-0.5">GET /api/v1/users/me</code> to
          check session validity or display user info.
        </p>

        <div className="rounded-xl border border-border overflow-hidden mb-4">
          <div className="border-b border-border px-4 py-2.5 bg-surface-2/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">auth_provider Values</p>
          </div>
          <div className="divide-y divide-border">
            {AUTH_PROVIDERS.map(({ value, desc }) => (
              <div key={value} className="flex items-start gap-4 px-4 py-3">
                <code className="shrink-0 font-mono text-xs text-violet-400 pt-0.5 min-w-[80px]">
                  {value}
                </code>
                <span className="text-sm text-text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {usersEndpoints.map((ep, i) => (
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

          {ep.responseExample && (
            <CodeBlock code={ep.responseExample} language="json" title="Response" />
          )}

          <StatusTable codes={ep.statusCodes} />
        </motion.section>
      ))}

      <DocsPager currentSlug="users" />
    </motion.div>
  )
}
