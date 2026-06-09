import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/Card'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton'

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card padding="lg">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Welcome back
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Sign in to your dashboard
          </p>
        </div>
        <LoginForm />
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface-1 px-3 text-xs text-text-tertiary uppercase tracking-wide">
              Or continue with
            </span>
          </div>
        </div>
        <GoogleAuthButton />
        <p className="text-sm text-text-tertiary text-center mt-5">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Get started
          </Link>
        </p>
      </Card>
    </motion.div>
  )
}
