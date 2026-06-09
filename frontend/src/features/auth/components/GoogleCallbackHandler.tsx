import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/Spinner'
import { useToastStore } from '@/store/toastStore'
import { useGoogleCallback } from '../api/authApi'

export function GoogleCallbackHandler() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  const hasRun = useRef(false)

  const callbackMutation = useGoogleCallback()

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      addToast('Invalid callback — missing code or state', 'error')
      navigate('/login')
      return
    }

    const storedState = sessionStorage.getItem('google_oauth_state')
    if (storedState && storedState !== state) {
      sessionStorage.removeItem('google_oauth_state')
      addToast('Invalid state parameter — possible CSRF attempt', 'error')
      navigate('/login')
      return
    }

    callbackMutation.mutate({ code, state })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" className="text-accent" />
      <p className="text-sm text-text-secondary">Signing you in with Google…</p>
    </div>
  )
}
