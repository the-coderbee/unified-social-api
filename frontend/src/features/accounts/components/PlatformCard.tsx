import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { getAuthUrl } from '../api/accountsApi'
import { useToastStore } from '@/store/toastStore'
import type { PlatformConfig } from '@/lib/constants'
import type { SocialAccount } from '../types/accounts.types'

interface PlatformCardProps {
  platform: PlatformConfig
  connectedAccount?: SocialAccount
  index?: number
}

export function PlatformCard({ platform, connectedAccount, index = 0 }: PlatformCardProps) {
  const [connecting, setConnecting] = useState(false)
  const { addToast } = useToastStore()
  const { Icon, label, color, implemented, description } = platform
  const isConnected = !!connectedAccount

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const { auth_url } = await getAuthUrl(platform.name)
      window.location.href = auth_url
    } catch {
      addToast(`Failed to get ${label} authorization URL`, 'error')
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    addToast('Disconnect coming soon', 'info')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
      className={`bg-surface-1 border border-surface-2 rounded-xl p-4 flex items-center gap-4 ${!implemented ? 'opacity-50' : ''}`}
    >
      {/* Platform icon */}
      <div
        className="size-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="size-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm text-text-primary">{label}</span>
          {!implemented && (
            <Badge variant="outline">Coming soon</Badge>
          )}
          {isConnected && (
            <Badge variant="success">
              <span className="size-1.5 rounded-full bg-success inline-block" />
              Connected
            </Badge>
          )}
        </div>
        <p className="text-xs text-text-tertiary truncate">
          {isConnected
            ? `ID: ${connectedAccount.provider_account_id}`
            : description}
        </p>
      </div>

      {/* Action */}
      {implemented && (
        <div className="shrink-0">
          {isConnected ? (
            <Button variant="ghost" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button variant="secondary" size="sm" loading={connecting} onClick={handleConnect}>
              Connect
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
