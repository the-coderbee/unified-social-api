import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/Card'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton'

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card padding="lg">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Create an account
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Start publishing to all your platforms at once
          </p>
        </div>
        <RegisterForm />
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
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </motion.div>
  )
}
