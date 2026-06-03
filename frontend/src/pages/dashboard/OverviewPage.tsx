import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMe } from '@/features/auth/api/authApi'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { PLATFORM_LIST } from '@/lib/constants'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="md">
      <p className="text-2xl font-bold tracking-tight text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary mt-0.5">{label}</p>
    </Card>
  )
}

export default function OverviewPage() {
  const { data: user, isLoading } = useMe()

  const connectedCount = user?.social_accounts.length ?? 0
  const emailName = user?.email.split('@')[0] ?? ''

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {greeting}{emailName ? `, ${emailName}` : ''}.
        </h1>
        <p className="text-text-secondary mt-1">
          {connectedCount === 0
            ? "Connect your first social account to get started."
            : `You have ${connectedCount} account${connectedCount > 1 ? 's' : ''} connected.`}
        </p>
      </motion.div>

      {/* Stats row */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <StatCard label="Connected accounts" value={connectedCount} />
          <StatCard label="Posts sent" value="—" />
          <StatCard label="Platforms" value={PLATFORM_LIST.length} />
        </motion.div>
      )}

      {/* CTA if no accounts */}
      {!isLoading && connectedCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16 }}
        >
          <Card padding="lg" className="flex flex-col items-center text-center gap-4">
            <div className="flex gap-2 mb-1">
              {PLATFORM_LIST.filter((p) => p.implemented).map((p) => (
                <div
                  key={p.name}
                  className="size-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${p.color}20`, color: p.color }}
                >
                  <p.Icon className="size-4" />
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-text-primary">No accounts connected yet</p>
              <p className="text-sm text-text-secondary mt-1">
                Connect Discord or X to start publishing
              </p>
            </div>
            <Link to="/dashboard/accounts">
              <Button variant="primary" size="md">Connect an account</Button>
            </Link>
          </Card>
        </motion.div>
      )}

      {/* Connected accounts preview */}
      {!isLoading && connectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Connected
            </h2>
            <Link to="/dashboard/accounts" className="text-xs text-accent hover:text-accent-hover transition-colors">
              Manage →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {user?.social_accounts.map((account) => {
              const platform = PLATFORM_LIST.find((p) => p.name === account.platform)
              if (!platform) return null
              return (
                <Card key={account.platform} padding="sm" className="flex items-center gap-3">
                  <div
                    className="size-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                  >
                    <platform.Icon className="size-3.5" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{platform.label}</span>
                  <span className="text-xs text-text-tertiary ml-auto truncate max-w-[160px]">
                    {account.provider_account_id}
                  </span>
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
