import { motion } from 'framer-motion'
import { Terminal, Lock, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import DocsPager from '../components/DocsPager'

const EASE = [0.16, 1, 0.3, 1] as const

const quickstartCode = `POST /api/v1/posts/ HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "content": "Hello from Unified Social API!",
  "platforms": ["discord", "x"]
}`

const quickstartResponse = `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "success",
  "results": [
    {
      "platform_name": "discord",
      "status": "success",
      "post_url": "https://discord.com/channels/..."
    },
    {
      "platform_name": "x",
      "status": "success",
      "post_url": "https://x.com/user/status/..."
    }
  ],
  "not_connected_platforms": []
}`

export default function IntroductionSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Overview */}
      <section id="overview" className="scroll-mt-24 mb-14">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3">
          Introduction
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-6">
          Unified Social API lets you publish content to multiple social platforms with a single HTTP
          request. Connect your accounts once, then post to X (Twitter), Discord, Mastodon, and
          LinkedIn — all concurrently, with built-in retry logic for partial failures.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            {
              icon: Zap,
              title: 'Concurrent Publishing',
              desc: 'All platforms receive your post simultaneously via async workers.',
            },
            {
              icon: Lock,
              title: 'OAuth2 PKCE',
              desc: 'Industry-standard PKCE protects every platform handshake.',
            },
            {
              icon: Terminal,
              title: 'Simple REST API',
              desc: 'Clean JSON API. One endpoint to publish everywhere.',
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: EASE }}
              className="rounded-xl border border-border bg-surface-1 p-4"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-from/20 to-accent-to/20">
                <Icon className="h-4 w-4 text-accent-light" />
              </div>
              <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quickstart */}
      <section id="quickstart" className="scroll-mt-24 mb-14">
        <h2 className="text-xl font-semibold text-text-primary mb-1">Quickstart</h2>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          Get from zero to posting in three steps.
        </p>

        <div className="flex flex-col gap-6">
          {[
            {
              step: '01',
              title: 'Create an account',
              desc: (
                <span>
                  Register at{' '}
                  <Link to="/register" className="text-accent-light hover:underline">
                    unified-social-api.com/register
                  </Link>{' '}
                  or via the API — <code className="text-xs bg-surface-2 rounded px-1 py-0.5 font-mono">POST /api/v1/auth/register</code>.
                </span>
              ),
            },
            {
              step: '02',
              title: 'Connect a social platform',
              desc: 'Link your social accounts via OAuth2 from the dashboard or using the Social Accounts endpoints.',
            },
            {
              step: '03',
              title: 'Post to all platforms',
              desc: 'Use your access token to call POST /api/v1/posts/ with content and target platforms.',
            },
          ].map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.3, ease: EASE }}
              className="flex gap-4"
            >
              <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-1 text-xs font-bold font-mono text-accent-light">
                {step}
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <CodeBlock code={quickstartCode} language="http" title="Request" />
          <CodeBlock code={quickstartResponse} language="json" title="Response" />
        </div>
      </section>

      {/* Base URL */}
      <section id="base-url" className="scroll-mt-24 mb-14">
        <h2 className="text-xl font-semibold text-text-primary mb-1">Base URL</h2>
        <p className="text-text-secondary text-sm mb-4 leading-relaxed">
          All API endpoints are relative to the following base URL:
        </p>
        <div className="rounded-xl border border-border bg-surface-1 px-4 py-3 font-mono text-sm text-accent-light">
          https://api.unified-social.dev/api/v1
        </div>
        <p className="mt-3 text-xs text-text-tertiary">
          When self-hosting, replace this with your own domain. The proxy in the dev server routes{' '}
          <code className="bg-surface-2 rounded px-1 font-mono">/api/*</code> to{' '}
          <code className="bg-surface-2 rounded px-1 font-mono">http://localhost:8000</code>.
        </p>
      </section>

      {/* Authentication */}
      <section id="authentication-header" className="scroll-mt-24 mb-14">
        <h2 className="text-xl font-semibold text-text-primary mb-1">Authentication</h2>
        <p className="text-text-secondary text-sm mb-4 leading-relaxed">
          Protected endpoints require a Bearer token in the{' '}
          <code className="text-xs bg-surface-2 rounded px-1 py-0.5 font-mono">Authorization</code> header.
          Obtain tokens via the{' '}
          <Link to="/docs/authentication" className="text-accent-light hover:underline">
            Authentication
          </Link>{' '}
          endpoints.
        </p>
        <CodeBlock
          code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
          language="http"
          title="Header"
        />
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex gap-3">
          <span className="text-amber-400 text-lg shrink-0 mt-0.5">⚠</span>
          <p className="text-sm text-amber-400/80 leading-relaxed">
            Access tokens expire in <strong className="text-amber-400">20 minutes</strong>. Use the{' '}
            <code className="text-xs font-mono">POST /api/v1/auth/refresh</code> endpoint to obtain a new
            pair using your refresh token (valid for 7 days).
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            to="/docs/authentication"
            className="inline-flex items-center gap-1.5 text-sm text-accent-light hover:underline"
          >
            View Authentication endpoints
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <DocsPager currentSlug="introduction" />
    </motion.div>
  )
}
