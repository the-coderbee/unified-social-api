import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '@/store/toastStore'
import type { ToastVariant } from '@/store/toastStore'
import { cn } from '@/lib/utils'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

const variantConfig: Record<ToastVariant, { icon: React.FC; color: string }> = {
  success: { icon: CheckIcon, color: 'text-success' },
  error: { icon: XCircleIcon, color: 'text-error' },
  info: { icon: InfoIcon, color: 'text-accent' },
}

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  return createPortal(
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icon: Icon, color } = variantConfig[toast.variant]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl',
                'bg-surface-1 border border-surface-2 shadow-lg shadow-black/30',
                'text-sm text-text-primary'
              )}
            >
              <span className={cn('mt-0.5 shrink-0', color)}>
                <Icon />
              </span>
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer mt-0.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>,
    document.body
  )
}
