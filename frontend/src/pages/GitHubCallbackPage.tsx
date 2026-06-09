import { GitHubCallbackHandler } from '@/features/auth/components/GitHubCallbackHandler'

export default function GitHubCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-0">
      <GitHubCallbackHandler />
    </div>
  )
}
