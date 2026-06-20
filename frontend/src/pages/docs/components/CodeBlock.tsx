import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Token {
  text: string
  className: string
}

function tokenizeJson(code: string): Token[] {
  const tokens: Token[] = []
  const lines = code.split('\n')
  for (const line of lines) {
    // key: "value" pattern
    const keyMatch = line.match(/^(\s*)("[\w-]+")\s*:(.*)$/)
    if (keyMatch) {
      if (keyMatch[1]) tokens.push({ text: keyMatch[1], className: '' })
      tokens.push({ text: keyMatch[2], className: 'text-violet-400' })
      tokens.push({ text: ': ', className: 'text-text-tertiary' })
      tokens.push(...tokenizeJsonValue(keyMatch[3]))
      tokens.push({ text: '\n', className: '' })
      continue
    }
    // Other lines (brackets, etc.)
    tokens.push({ text: line + '\n', className: 'text-text-tertiary' })
  }
  return tokens
}

function tokenizeJsonValue(value: string): Token[] {
  const trimmed = value.trim()
  // Remove trailing comma
  const hasComma = trimmed.endsWith(',')
  const raw = hasComma ? trimmed.slice(0, -1).trim() : trimmed

  let className = 'text-text-secondary'
  if (raw.startsWith('"')) className = 'text-emerald-400'
  else if (raw === 'true' || raw === 'false' || raw === 'null') className = 'text-blue-400'
  else if (/^-?\d/.test(raw)) className = 'text-orange-400'
  else if (raw === '[' || raw === ']' || raw === '{' || raw === '}') className = 'text-text-tertiary'

  return [
    { text: raw, className },
    ...(hasComma ? [{ text: ',', className: 'text-text-tertiary' }] : []),
  ]
}

function tokenizeHttp(code: string): Token[] {
  const tokens: Token[] = []
  const lines = code.split('\n')
  let isFirstLine = true
  let pastHeaders = false

  for (const line of lines) {
    if (isFirstLine) {
      // e.g. "POST /api/v1/posts/ HTTP/1.1"
      const parts = line.split(' ')
      if (parts.length >= 2) {
        tokens.push({ text: parts[0], className: 'gradient-text font-bold' })
        tokens.push({ text: ' ', className: '' })
        tokens.push({ text: parts.slice(1).join(' '), className: 'text-text-secondary' })
      } else {
        tokens.push({ text: line, className: 'text-text-secondary' })
      }
      tokens.push({ text: '\n', className: '' })
      isFirstLine = false
      continue
    }

    if (line === '') {
      pastHeaders = true
      tokens.push({ text: '\n', className: '' })
      continue
    }

    if (!pastHeaders) {
      // Headers
      const colonIdx = line.indexOf(':')
      if (colonIdx > -1) {
        tokens.push({ text: line.slice(0, colonIdx), className: 'text-text-tertiary' })
        tokens.push({ text: ': ', className: 'text-text-tertiary' })
        tokens.push({ text: line.slice(colonIdx + 2), className: 'text-text-secondary' })
      } else {
        tokens.push({ text: line, className: 'text-text-secondary' })
      }
    } else {
      // Body (form-encoded or JSON)
      tokens.push({ text: line, className: 'text-emerald-400' })
    }
    tokens.push({ text: '\n', className: '' })
  }
  return tokens
}

interface CodeBlockProps {
  code: string
  language?: 'json' | 'http' | 'plain'
  title?: string
  className?: string
}

export default function CodeBlock({ code, language = 'json', title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tokens: Token[] =
    language === 'json'
      ? tokenizeJson(code)
      : language === 'http'
        ? tokenizeHttp(code)
        : [{ text: code, className: 'text-text-secondary' }]

  return (
    <div className={cn('mb-6 overflow-hidden rounded-xl border border-border', className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border bg-surface-1 px-4 py-2">
          <span className="text-xs font-medium text-text-tertiary">{title}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors hover:bg-surface-2"
            aria-label="Copy code"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-emerald-400"
                >
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}
      <div className="relative group">
        {!title && (
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-border bg-surface-1 px-2 py-1 text-xs text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity hover:text-text-secondary"
            aria-label="Copy code"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3 h-3" /> Copied
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
        <pre className="overflow-x-auto bg-[#0c0c0c] p-4 text-xs leading-relaxed font-mono">
          <code>
            {tokens.map((token, i) => (
              <span key={i} className={token.className}>
                {token.text}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
