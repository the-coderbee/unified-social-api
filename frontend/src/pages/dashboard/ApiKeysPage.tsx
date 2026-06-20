import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Plus, Copy, Check, AlertTriangle, Shield, X } from 'lucide-react'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/features/api-keys/hooks/useApiKeys'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { API_KEY_SCOPES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { APIKeyCreateResponse, APIKeyResponse } from '@/types/api'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

// ─── Revoke row inline confirm ──────────────────────────────────────
function RevokeCell({ apiKey }: { apiKey: APIKeyResponse }) {
  const [confirming, setConfirming] = useState(false)
  const { mutate: revoke, isPending } = useRevokeApiKey()

  if (!apiKey.is_active) {
    return <span className="text-xs text-text-tertiary">Revoked</span>
  }

  return (
    <AnimatePresence mode="wait">
      {confirming ? (
        <motion.div
          key="confirm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => revoke(apiKey.id)}
            disabled={isPending}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/15 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? 'Revoking…' : 'Confirm revoke'}
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="revoke"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setConfirming(true)}
          className="text-xs text-text-tertiary hover:text-error transition-colors"
        >
          Revoke
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ─── Copy button ────────────────────────────────────────────────────
function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={['p-2 rounded-lg border border-border hover:border-border-active hover:bg-surface-2 transition-colors', className].join(' ')}
      aria-label="Copy to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="check" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
            <Check className="w-4 h-4 text-success" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
            <Copy className="w-4 h-4 text-text-tertiary" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// ─── Reveal modal ───────────────────────────────────────────────────
function RevealModal({ created, onClose }: { created: APIKeyCreateResponse; onClose: () => void }) {
  return (
    <div className="space-y-5">
      {/* Warning */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/8 px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-warning">Save this key now</p>
          <p className="text-xs text-warning/80 mt-0.5">
            This key will never be shown again. Store it securely.
          </p>
        </div>
      </div>

      {/* Key info */}
      <div>
        <p className="text-xs font-medium text-text-tertiary mb-1">Key name</p>
        <p className="text-sm font-semibold text-text-primary">{created.name}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-text-tertiary mb-1">Prefix</p>
        <code className="font-mono text-sm text-accent-light">{created.key_prefix}…</code>
      </div>

      {/* Full key */}
      <div>
        <p className="text-xs font-medium text-text-tertiary mb-2">Full API Key</p>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-0 p-3">
          <code className="font-mono text-xs text-text-primary flex-1 break-all select-all">
            {created.api_key}
          </code>
          <CopyButton text={created.api_key} className="shrink-0" />
        </div>
      </div>

      <Button variant="primary" size="md" className="w-full justify-center" onClick={onClose}>
        Done — I've saved my key
      </Button>
    </div>
  )
}

// ─── Create modal ───────────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [nameError, setNameError] = useState<string>()
  const [createdKey, setCreatedKey] = useState<APIKeyCreateResponse | null>(null)
  const { mutate: createKey, isPending } = useCreateApiKey()

  function toggleScope(scope: string) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setNameError('Key name is required.'); return }
    createKey(
      { name: name.trim(), scopes: selectedScopes },
      { onSuccess: (data) => setCreatedKey(data) }
    )
  }

  if (createdKey) {
    return <RevealModal created={createdKey} onClose={onClose} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Key name"
        placeholder="e.g. Production server"
        value={name}
        onChange={(e) => { setName(e.target.value); setNameError(undefined) }}
        error={nameError}
        autoFocus
      />

      <div>
        <p className="text-sm font-medium text-text-secondary mb-3">Scopes (optional)</p>
        <div className="space-y-2">
          {API_KEY_SCOPES.map(({ value, label, description }) => (
            <label
              key={value}
              className={[
                'flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors',
                selectedScopes.includes(value)
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-border bg-surface-2 hover:border-border-active',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={selectedScopes.includes(value)}
                onChange={() => toggleScope(value)}
                className="mt-0.5 accent-violet-600"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-tertiary">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" size="md" className="flex-1 justify-center" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="flex-1 justify-center" disabled={isPending}>
          {isPending ? 'Creating…' : 'Create key'}
        </Button>
      </div>
    </form>
  )
}

// ─── Modal wrapper ──────────────────────────────────────────────────
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-text-primary">New API Key</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main page ──────────────────────────────────────────────────────
export default function ApiKeysPage() {
  const { data: keys, isLoading } = useApiKeys()
  const [modalOpen, setModalOpen] = useState(false)

  function openModal() { setModalOpen(true) }
  function closeModal() { setModalOpen(false) }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">API Keys</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage scoped keys for server-to-server integrations.
          </p>
        </div>
        <Button variant="primary" size="sm" className="gap-2 shrink-0" onClick={openModal}>
          <Plus className="w-4 h-4" />
          New Key
        </Button>
      </motion.div>

      {/* Keys table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border border-border bg-surface-1 overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-32 rounded bg-surface-2" />
                  <div className="h-2.5 w-24 rounded bg-surface-2 font-mono" />
                </div>
                <div className="h-5 w-16 rounded-full bg-surface-2" />
                <div className="h-4 w-24 rounded bg-surface-2" />
                <div className="h-4 w-12 rounded bg-surface-2" />
              </div>
            ))}
          </div>
        ) : !keys || keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Key className="w-5 h-5 text-accent-light" />
            </div>
            <p className="text-base font-semibold text-text-secondary">No API keys yet</p>
            <p className="mt-1 text-sm text-text-tertiary mb-5">
              Create a key to start integrating with the API.
            </p>
            <Button variant="primary" size="sm" className="gap-2" onClick={openModal}>
              <Plus className="w-4 h-4" />
              Create your first key
            </Button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-border bg-surface-2">
              {['Name / Prefix', 'Scopes', 'Status', 'Created', 'Actions'].map((h) => (
                <span key={h} className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                  {h}
                </span>
              ))}
            </div>

            <ul className="divide-y divide-border">
              {keys.map((key) => (
                <motion.li
                  key={key.id}
                  layout
                  className={[
                    'px-5 py-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-3 md:gap-4 items-center transition-opacity',
                    !key.is_active && 'opacity-50',
                  ].join(' ')}
                >
                  {/* Name + prefix */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                      <span className="text-sm font-semibold text-text-primary">{key.name}</span>
                    </div>
                    <code className="text-xs font-mono text-text-tertiary mt-1 block">
                      {key.key_prefix}…
                    </code>
                  </div>

                  {/* Scopes */}
                  <div className="flex flex-wrap gap-1.5 md:justify-end">
                    {key.scopes.length === 0 ? (
                      <span className="text-xs text-text-tertiary">—</span>
                    ) : (
                      key.scopes.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-2 py-0.5 rounded-full border border-border bg-surface-2 text-text-secondary"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    {key.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 border border-success/20 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary bg-surface-2 border border-border rounded-full px-2.5 py-1">
                        Revoked
                      </span>
                    )}
                  </div>

                  {/* Created */}
                  <span className="text-xs text-text-tertiary whitespace-nowrap">
                    {formatDate(key.created_at)}
                  </span>

                  {/* Actions */}
                  <div className="flex justify-start md:justify-end">
                    <RevokeCell apiKey={key} />
                  </div>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </motion.div>

      {/* Create modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <CreateModal onClose={closeModal} />
      </Modal>
    </div>
  )
}
