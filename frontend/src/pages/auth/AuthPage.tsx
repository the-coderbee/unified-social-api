import { useState, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'
import axios from 'axios'
import Input from '@/components/Input'
import Button from '@/components/Button'
import OAuthButtons from '@/features/auth/components/OAuthButtons'
import { useLogin, useRegister } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

type Tab = 'login' | 'register'

function getErrorMessage(error: Error | null): string | null {
  if (!error) return null

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const detail = error.response?.data?.detail as string | undefined

    if (detail) {
      if (detail.toLowerCase().includes('already exists'))
        return 'An account with this email already exists.'
      if (detail.toLowerCase().includes('invalid credentials'))
        return 'Incorrect email or password.'
      if (/please use .+ to login/i.test(detail)) {
        const match = detail.match(/use (\w+) to login/i)
        const provider = match?.[1] ? (match[1].charAt(0).toUpperCase() + match[1].slice(1)) : 'a social provider'
        return `This account was registered with ${provider}. Use the "${provider}" button below.`
      }
      if (detail.toLowerCase().includes('rate limit') || status === 429)
        return 'Too many attempts. Please wait a minute and try again.'
    }

    if (status === 401) return 'Incorrect email or password.'
    if (status === 400 && detail) return detail
    if (status === 429) return 'Too many attempts. Please wait a minute and try again.'
    if (status !== undefined && status >= 500)
      return 'Server error. Please try again in a moment.'
  }

  return 'Something went wrong. Please try again.'
}

interface LoginFormProps {
  onSwitch: () => void
}

function LoginForm({ onSwitch }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const { mutate, isPending, error, isError } = useLogin()

  function validate(): boolean {
    const errs: typeof fieldErrors = {}
    if (!email) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Password is required.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    mutate({ email, password })
  }

  return (
    <motion.form
      key="login"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: EASE }}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/8 px-3.5 py-3 text-sm text-error"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </motion.div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
        error={fieldErrors.email}
        autoComplete="email"
        autoFocus
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password-login" className="text-sm font-medium text-text-secondary">
            Password
          </label>
          <button
            type="button"
            className="text-xs text-text-tertiary transition-colors hover:text-accent-light"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="password-login"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })) }}
            autoComplete="current-password"
            className={cn(
              'w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 pr-10 text-sm text-text-primary',
              'placeholder:text-text-tertiary outline-none transition-all duration-150',
              'border-border focus:border-accent focus:ring-2 focus:ring-accent/20',
              fieldErrors.password && 'border-error focus:border-error focus:ring-error/20'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-secondary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>
          {fieldErrors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-error"
            >
              {fieldErrors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full justify-center mt-1"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in…
          </span>
        ) : (
          'Sign in'
        )}
      </Button>

      <Divider />
      <OAuthButtons disabled={isPending} />

      <p className="text-center text-sm text-text-tertiary">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-accent-light hover:underline">
          Create one
        </button>
      </p>
    </motion.form>
  )
}

interface RegisterFormProps {
  onSwitch: () => void
}

function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirm?: string }>({})
  const { mutate, isPending, error, isError } = useRegister()

  function validate(): boolean {
    const errs: typeof fieldErrors = {}
    if (!email) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Password is required.'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.'
    else if (password.length > 128) errs.password = 'Password must be under 128 characters.'
    if (!confirm) errs.confirm = 'Please confirm your password.'
    else if (confirm !== password) errs.confirm = 'Passwords do not match.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    mutate({ email, password })
  }

  return (
    <motion.form
      key="register"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22, ease: EASE }}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/8 px-3.5 py-3 text-sm text-error"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </motion.div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
        error={fieldErrors.email}
        autoComplete="email"
        autoFocus
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password-register" className="text-sm font-medium text-text-secondary">
          Password
        </label>
        <div className="relative">
          <input
            id="password-register"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })) }}
            autoComplete="new-password"
            className={cn(
              'w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 pr-10 text-sm text-text-primary',
              'placeholder:text-text-tertiary outline-none transition-all duration-150',
              'border-border focus:border-accent focus:ring-2 focus:ring-accent/20',
              fieldErrors.password && 'border-error focus:border-error focus:ring-error/20'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-secondary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>
          {fieldErrors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-error"
            >
              {fieldErrors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Input
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        value={confirm}
        onChange={(e) => { setConfirm(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })) }}
        error={fieldErrors.confirm}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full justify-center mt-1"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account…
          </span>
        ) : (
          'Create account'
        )}
      </Button>

      <Divider />
      <OAuthButtons disabled={isPending} />

      <p className="text-center text-sm text-text-tertiary">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-accent-light hover:underline">
          Sign in
        </button>
      </p>
    </motion.form>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-text-tertiary">or continue with</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

interface AuthPageProps {
  initialTab?: Tab
}

export default function AuthPage({ initialTab = 'login' }: AuthPageProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get('error') === 'oauth_failed'

  useEffect(() => {
    const path = location.pathname
    if (path === '/register') setTab('register')
    else setTab('login')
  }, [location.pathname])

  function switchTab(next: Tab) {
    setTab(next)
    window.history.replaceState(null, '', `/${next === 'login' ? 'login' : 'register'}`)
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-surface-0 bg-grid-pattern px-4 py-12 overflow-hidden">
      {/* Background orbs */}
      <div
        className="absolute pointer-events-none animate-float"
        style={{
          width: '600px',
          height: '600px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animationDelay: '0s',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none animate-float"
        style={{
          width: '400px',
          height: '400px',
          top: '60%',
          left: '55%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animationDelay: '2s',
        }}
        aria-hidden="true"
      />

      {/* Back to home */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="mb-8"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-active hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="font-semibold text-text-primary">Unified</span>
          <span className="text-text-secondary">Social API</span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
        className="relative w-full max-w-[420px]"
      >
        <div
          className="rounded-2xl border border-border bg-surface-1 p-8"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {/* OAuth error banner */}
          <AnimatePresence>
            {oauthError && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/8 px-3.5 py-3 text-sm text-error overflow-hidden"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>OAuth sign-in failed. Please try again or use email.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-text-primary">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1 text-sm text-text-tertiary">
              {tab === 'login'
                ? 'Sign in to your Unified Social API account'
                : 'Start publishing to every platform at once'}
            </p>
          </div>

          {/* Tabs */}
          <div className="relative mb-6 flex rounded-lg bg-surface-2 p-1">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className="relative flex-1 rounded-md py-2 text-sm font-medium transition-colors z-10"
                style={{
                  color: tab === t ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                {tab === t && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-md bg-surface-3"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative">
                  {t === 'login' ? 'Sign in' : 'Create account'}
                </span>
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <LoginForm key="login" onSwitch={() => switchTab('register')} />
            ) : (
              <RegisterForm key="register" onSwitch={() => switchTab('login')} />
            )}
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-text-tertiary">
          By continuing, you agree to our{' '}
          <span className="cursor-pointer hover:text-text-secondary transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="cursor-pointer hover:text-text-secondary transition-colors">Privacy Policy</span>
          .
        </p>
      </motion.div>
    </div>
  )
}
