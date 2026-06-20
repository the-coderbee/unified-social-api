import { motion } from 'framer-motion'
import { authEndpoints } from '../config/docsConfig'
import EndpointBadge from '../components/EndpointBadge'
import CodeBlock from '../components/CodeBlock'
import ParamTable from '../components/ParamTable'
import StatusTable from '../components/StatusTable'
import DocsPager from '../components/DocsPager'

const EASE = [0.16, 1, 0.3, 1] as const

export default function AuthenticationSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3" id="authentication">
          Authentication
        </h1>
        <p className="text-text-secondary leading-relaxed">
          Unified Social API uses JWT-based authentication. After login you receive an{' '}
          <strong className="text-text-primary">access token</strong> (20 min TTL) and a{' '}
          <strong className="text-text-primary">refresh token</strong> (7 day TTL). Pass the
          access token as a Bearer token on all protected requests.
        </p>
        <p className="mt-3 text-text-secondary leading-relaxed">
          Social login (Google, GitHub) follows the OAuth2 PKCE flow: initialize to get the
          authorization URL, redirect the user, then exchange the callback code for a token pair.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Access token TTL', value: '20 minutes' },
            { label: 'Refresh token TTL', value: '7 days' },
            { label: 'Algorithm', value: 'HS256' },
            { label: 'Rate limit', value: '5 req / 60 s' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-surface-1 px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-text-tertiary">{label}</span>
              <span className="text-xs font-mono font-medium text-text-primary">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {authEndpoints.map((ep, i) => (
        <motion.section
          key={ep.id}
          id={ep.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
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
              <CodeBlock code={ep.requestExample} language={ep.requestExample.startsWith('Content-Type') ? 'http' : 'json'} title="Request body" />
            )}
            {ep.responseExample && (
              <CodeBlock code={ep.responseExample} language="json" title="Response" />
            )}
          </div>

          <StatusTable codes={ep.statusCodes} />
        </motion.section>
      ))}

      <DocsPager currentSlug="authentication" />
    </motion.div>
  )
}
