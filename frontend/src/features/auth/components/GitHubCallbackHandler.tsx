import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/Spinner'
import { useToastStore } from '@/store/toastStore'
import { useGithubCallback } from '../api/authApi'

export function GitHubCallbackHandler() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  const hasRun = useRef(false)

  const callbackMutation = useGithubCallback()

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

    const storedState = sessionStorage.getItem('github_oauth_state')
    if (storedState && storedState !== state) {
      sessionStorage.removeItem('github_oauth_state')
      addToast('Invalid state parameter — possible CSRF attempt', 'error')
      navigate('/login')
      return
    }

    callbackMutation.mutate({ code, state })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" className="text-accent" />
      <p className="text-sm text-text-secondary">Signing you in with GitHub…</p>
    </div>
  )
}
