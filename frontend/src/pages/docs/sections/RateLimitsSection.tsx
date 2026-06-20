import { motion } from 'framer-motion'
import CodeBlock from '../components/CodeBlock'
import DocsPager from '../components/DocsPager'

const EASE = [0.16, 1, 0.3, 1] as const

const RATE_LIMITS = [
  { endpoint: '/api/v1/auth/*', limit: '5 req / 60 s', notes: 'Strict — applies to login and register.' },
  { endpoint: '/api/v1/posts/*', limit: '30 req / 60 s', notes: 'Per authenticated user.' },
  { endpoint: '/api/v1/social/*', limit: '30 req / 60 s', notes: 'Per authenticated user.' },
  { endpoint: '/api/v1/users/*', limit: '60 req / 60 s', notes: 'Per authenticated user.' },
  { endpoint: '/api/v1/api-keys/*', limit: '20 req / 60 s', notes: 'Per authenticated user.' },
]

const ERROR_CODES = [
  { code: 400, name: 'Bad Request', desc: 'Invalid input, business-logic violation, or malformed request body.' },
  { code: 401, name: 'Unauthorized', desc: 'Missing, invalid, or expired access token.' },
  { code: 403, name: 'Forbidden', desc: 'Token is valid but lacks permission for this resource.' },
  { code: 404, name: 'Not Found', desc: 'Resource does not exist or does not belong to the authenticated user.' },
  { code: 422, name: 'Unprocessable Entity', desc: 'Pydantic validation failed — check the `detail` array for field-level errors.' },
  { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded. Respect the Retry-After header.' },
  { code: 500, name: 'Internal Server Error', desc: 'Unexpected server error. Retry with exponential backoff.' },
]

const ENV_VARS = [
  { name: 'SECRET_KEY', required: true, desc: 'Long random string for signing JWT tokens.' },
  { name: 'ALGORITHM', required: false, desc: 'JWT signing algorithm. Default: HS256.' },
  { name: 'ACCESS_TOKEN_EXPIRE_MINUTES', required: false, desc: 'Access token TTL in minutes. Default: 20.' },
  { name: 'REFRESH_TOKEN_EXPIRE_DAYS', required: false, desc: 'Refresh token TTL in days. Default: 7.' },
  { name: 'DATABASE_URL', required: true, desc: 'PostgreSQL async connection string (postgresql+asyncpg://).' },
  { name: 'REDIS_URL', required: true, desc: 'Redis connection string for rate limiting and OAuth state.' },
  { name: 'GOOGLE_CLIENT_ID', required: false, desc: 'Google OAuth2 client ID.' },
  { name: 'GOOGLE_CLIENT_SECRET', required: false, desc: 'Google OAuth2 client secret.' },
  { name: 'GOOGLE_REDIRECT_URI', required: false, desc: 'Google OAuth2 redirect URI.' },
  { name: 'GITHUB_CLIENT_ID', required: false, desc: 'GitHub OAuth2 client ID.' },
  { name: 'GITHUB_CLIENT_SECRET', required: false, desc: 'GitHub OAuth2 client secret.' },
  { name: 'GITHUB_REDIRECT_URI', required: false, desc: 'GitHub OAuth2 redirect URI.' },
  { name: 'DISCORD_CLIENT_ID', required: false, desc: 'Discord OAuth2 client ID.' },
  { name: 'DISCORD_CLIENT_SECRET', required: false, desc: 'Discord OAuth2 client secret.' },
  { name: 'DISCORD_REDIRECT_URI', required: false, desc: 'Discord OAuth2 redirect URI.' },
  { name: 'X_CLIENT_ID', required: false, desc: 'X (Twitter) OAuth2 client ID.' },
  { name: 'X_CLIENT_SECRET', required: false, desc: 'X (Twitter) OAuth2 client secret.' },
  { name: 'X_REDIRECT_URI', required: false, desc: 'X (Twitter) OAuth2 redirect URI.' },
  { name: 'CORS_ORIGINS', required: false, desc: 'Comma-separated list of allowed CORS origins.' },
]

const errorResponseExample = `{
  "detail": "Invalid credentials"
}`

const validationErrorExample = `{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}`

export default function RateLimitsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Rate Limits */}
      <section id="rate-limits-overview" className="scroll-mt-24 mb-14">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3">
          Rate Limits & Errors
        </h1>
        <p className="text-text-secondary leading-relaxed mb-6">
          All endpoints are rate limited using a sliding window algorithm enforced via Redis. Limits
          are applied per user (for authenticated endpoints) or per IP (for public endpoints).
        </p>

        <h2 className="text-xl font-semibold text-text-primary mb-4" id="rate-limits-overview-h">
          Rate Limits
        </h2>

        <div className="rounded-xl border border-border overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Endpoint Group
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Limit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {RATE_LIMITS.map((row, i) => (
                <tr key={row.endpoint} className={i % 2 === 1 ? 'bg-surface-1/40' : 'bg-transparent'}>
                  <td className="px-4 py-3">
                    <code className="font-mono text-xs text-accent-light">{row.endpoint}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-orange-400 bg-orange-500/10 rounded px-1.5 py-0.5">
                      {row.limit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-400/80 leading-relaxed">
            When rate limited, the API returns <code className="text-xs font-mono text-amber-400">429 Too Many Requests</code>.
            Check the <code className="text-xs font-mono text-amber-400">Retry-After</code> header for the number of seconds
            to wait before retrying.
          </p>
        </div>
      </section>

      {/* Error Codes */}
      <section id="error-codes" className="scroll-mt-24 mb-14">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Error Codes</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          All errors return a JSON body with a <code className="text-xs font-mono bg-surface-2 rounded px-1">detail</code> field.
          For validation errors (422), <code className="text-xs font-mono bg-surface-2 rounded px-1">detail</code> is an array of
          field-level error objects.
        </p>

        <div className="rounded-xl border border-border overflow-hidden mb-6">
          <div className="divide-y divide-border">
            {ERROR_CODES.map(({ code, name, desc }) => {
              const color =
                code >= 500 ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                code >= 400 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                'text-blue-400 bg-blue-500/10 border-blue-500/20'
              return (
                <div key={code} className="flex items-start gap-4 px-4 py-3">
                  <span className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${color}`}>
                    {code}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CodeBlock code={errorResponseExample} language="json" title="Standard error" />
          <CodeBlock code={validationErrorExample} language="json" title="Validation error (422)" />
        </div>
      </section>

      {/* Environment Config */}
      <section id="environment-config" className="scroll-mt-24 mb-14">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Environment Configuration</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          The following environment variables are required to run the API. Copy{' '}
          <code className="text-xs font-mono bg-surface-2 rounded px-1">.env.example</code> and fill in your values.
        </p>

        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                  Variable
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Required
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {ENV_VARS.map((v, i) => (
                <tr key={v.name} className={i % 2 === 1 ? 'bg-surface-1/40' : 'bg-transparent'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <code className="font-mono text-xs text-violet-400">{v.name}</code>
                  </td>
                  <td className="px-4 py-3">
                    {v.required ? (
                      <span className="text-xs text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-xs text-text-tertiary">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{v.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <DocsPager currentSlug="rate-limits" />
    </motion.div>
  )
}
