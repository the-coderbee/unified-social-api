import { Card } from '@/components/Card'

function SkeletonPost() {
  return (
    <Card padding="md" className="opacity-60">
      <div className="flex items-start gap-3">
        <div className="size-8 rounded-full bg-surface-3 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-surface-3 rounded w-1/3" />
          <div className="h-3 bg-surface-3 rounded w-full" />
          <div className="h-3 bg-surface-3 rounded w-4/5" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 w-16 bg-surface-3 rounded-full" />
            <div className="h-5 w-16 bg-surface-3 rounded-full" />
          </div>
        </div>
        <div className="h-5 w-20 bg-surface-3 rounded shrink-0" />
      </div>
    </Card>
  )
}

export function PostsList() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-surface-0/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-2 z-10">
        <div className="size-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary mb-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <p className="font-semibold text-text-primary text-sm">Post history coming soon</p>
        <p className="text-xs text-text-tertiary">Your published posts will appear here</p>
      </div>
      <div className="flex flex-col gap-3 opacity-40 pointer-events-none">
        <SkeletonPost />
        <SkeletonPost />
        <SkeletonPost />
      </div>
    </div>
  )
}
