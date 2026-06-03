import { useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Spinner } from '@/components/Spinner'
import { useToastStore } from '@/store/toastStore'
import { useLinkAccount } from '../api/accountsApi'
import { useNavigate } from 'react-router-dom'

export function OAuthCallbackHandler() {
  const { platform } = useParams<{ platform: string }>()
  const [searchParams] = useSearchParams()
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  const hasRun = useRef(false)

  const linkMutation = useLinkAccount(platform ?? '')

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      addToast('Invalid callback URL — missing code or state', 'error')
      navigate('/dashboard/accounts')
      return
    }

    linkMutation.mutate({ code, state })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" className="text-accent" />
      <p className="text-sm text-text-secondary">
        Connecting your {platform} account...
      </p>
    </div>
  )
}
