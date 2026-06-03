import { PLATFORM_LIST } from '@/lib/constants'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import type { PlatformName } from '@/lib/constants'

function ComingSoonOverlay() {
  return (
    <div className="absolute inset-0 bg-surface-0/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-2 z-10">
      <div className="size-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary mb-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p className="font-semibold text-text-primary text-sm">Posting API coming soon</p>
      <p className="text-xs text-text-tertiary">We're building it — stay tuned</p>
    </div>
  )
}

export function ComposeForm() {
  const platforms: PlatformName[] = ['discord', 'x', 'reddit', 'linkedin']

  return (
    <div className="relative">
      <ComingSoonOverlay />
      <Card className="opacity-40 pointer-events-none">
        <div className="flex flex-col gap-5">
          {/* Platform selector */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2.5 uppercase tracking-wider">Post to</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => {
                const config = PLATFORM_LIST.find((pl) => pl.name === p)!
                return (
                  <label key={p} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked={p === 'discord' || p === 'x'} className="sr-only" readOnly />
                    <div className="size-4 rounded border border-surface-3 bg-surface-2 flex items-center justify-center">
                      <div className="size-2 rounded-sm bg-accent" />
                    </div>
                    <Badge platform={p}>
                      <config.Icon className="size-3" />
                      {config.label}
                    </Badge>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Content area */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2.5 uppercase tracking-wider">Content</p>
            <div className="min-h-32 bg-surface-0 border border-surface-3 rounded-lg p-3 text-sm text-text-tertiary">
              What do you want to share?
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-surface-2">
            <span className="text-xs text-text-tertiary">0 / 280</span>
            <div className="h-8 w-24 bg-accent/30 rounded-lg" />
          </div>
        </div>
      </Card>
    </div>
  )
}
