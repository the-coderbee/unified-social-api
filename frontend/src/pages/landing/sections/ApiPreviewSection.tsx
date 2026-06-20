import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Zap, RefreshCw, Shield, Activity } from 'lucide-react'

const REQUEST = `POST /api/v1/posts/ HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "content": "Just shipped v2. Async publishing,
              PKCE auth, retry logic — all in one.",
  "platforms": ["discord", "x"]
}`

const RESPONSE = `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "SUCCESS",
  "results": [
    {
      "platform_name": "discord",
      "status": "SUCCESS",
      "post_url": "https://discord.com/channels/..."
    },
    {
      "platform_name": "x",
      "status": "SUCCESS",
      "post_url": "https://x.com/user/status/..."
    }
  ]
}`

const benefits = [
  { icon: Zap, text: 'All platforms publish concurrently — no serial waiting' },
  { icon: RefreshCw, text: 'Failed platforms retry individually without re-posting content' },
  { icon: Shield, text: 'OAuth2 PKCE protects every platform handshake' },
  { icon: Activity, text: 'Sliding window rate limiting keeps your integration fair' },
]

function CodeLine({ children }: { children: React.ReactNode }) {
  return <div className="leading-6">{children}</div>
}

function renderRequest(code: string) {
  return code.split('\n').map((line, i) => {
    if (line.startsWith('POST') || line.startsWith('GET') || line.startsWith('HTTP')) {
      const [method, ...rest] = line.split(' ')
      return (
        <CodeLine key={i}>
          <span className="text-accent-light font-semibold">{method}</span>
          {rest.length > 0 && <span className="text-text-secondary"> {rest.join(' ')}</span>}
        </CodeLine>
      )
    }
    if (line.includes(':') && !line.trim().startsWith('"') && !line.trim().startsWith('{') && !line.trim().startsWith('}')) {
      const colonIdx = line.indexOf(':')
      return (
        <CodeLine key={i}>
          <span className="text-text-tertiary">{line.slice(0, colonIdx + 1)}</span>
          <span className="text-text-secondary">{line.slice(colonIdx + 1)}</span>
        </CodeLine>
      )
    }
    if (line.trim().startsWith('"') && line.includes(':')) {
      const match = line.match(/^(\s*)("[\w_]+")(\s*:\s*)(.*)$/)
      if (match) {
        return (
          <CodeLine key={i}>
            <span>{match[1]}</span>
            <span className="text-blue-400">{match[2]}</span>
            <span className="text-text-tertiary">{match[3]}</span>
            <span className="text-green-400">{match[4]}</span>
          </CodeLine>
        )
      }
    }
    return <CodeLine key={i}><span className="text-text-tertiary">{line}</span></CodeLine>
  })
}

export default function ApiPreviewSection() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeTab === 'request' ? REQUEST : RESPONSE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="docs" className="section-padding border-t border-border">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-4">
              Simple API.{' '}
              <span className="gradient-text">Powerful results.</span>
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              One endpoint handles the complexity of multi-platform publishing.
              No SDKs, no platform-specific quirks — just clean JSON in and JSON out.
            </p>

            <ul className="space-y-4">
              {benefits.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-accent-light" />
                  </div>
                  <span className="text-sm text-text-secondary leading-relaxed">{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: code block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-border bg-surface-1 overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Tabs + copy */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
              <div className="flex items-center gap-1">
                {(['request', 'response'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-surface-3 text-text-primary'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleCopy}
                className="relative flex items-center justify-center w-7 h-7 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-3 transition-colors"
                aria-label="Copy code"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span key="check" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.15 }}>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.15 }}>
                      <Copy className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Code content */}
            <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderRequest(activeTab === 'request' ? REQUEST : RESPONSE)}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
