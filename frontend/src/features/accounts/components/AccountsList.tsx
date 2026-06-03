import { PLATFORM_LIST } from '@/lib/constants'
import { PlatformCard } from './PlatformCard'
import type { SocialAccount } from '../types/accounts.types'

interface AccountsListProps {
  socialAccounts: SocialAccount[]
}

export function AccountsList({ socialAccounts }: AccountsListProps) {
  return (
    <div className="flex flex-col gap-3">
      {PLATFORM_LIST.map((platform, index) => {
        const connected = socialAccounts.find((a) => a.platform === platform.name)
        return (
          <PlatformCard
            key={platform.name}
            platform={platform}
            connectedAccount={connected}
            index={index}
          />
        )
      })}
    </div>
  )
}
