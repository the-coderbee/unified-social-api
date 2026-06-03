import { motion } from 'framer-motion'
import { useMe } from '@/features/auth/api/authApi'
import { AccountsList } from '@/features/accounts/components/AccountsList'
import { Spinner } from '@/components/Spinner'

export default function AccountsPage() {
  const { data: user, isLoading } = useMe()

  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-7"
      >
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Connected Accounts
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Manage your social platform connections
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" className="text-accent" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <AccountsList socialAccounts={user?.social_accounts ?? []} />
        </motion.div>
      )}
    </div>
  )
}
