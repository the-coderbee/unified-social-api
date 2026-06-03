import type { ComponentType } from 'react'
import { DiscordIcon, XIcon, RedditIcon, LinkedInIcon } from './icons'

export const API_BASE_URL = 'http://localhost:8000/api/v1'

export type PlatformName = 'discord' | 'x' | 'reddit' | 'linkedin'

export interface PlatformConfig {
  name: PlatformName
  label: string
  color: string
  implemented: boolean
  description: string
  Icon: ComponentType<{ className?: string }>
}

export const PLATFORMS: Record<PlatformName, PlatformConfig> = {
  discord: {
    name: 'discord',
    label: 'Discord',
    color: '#5865F2',
    implemented: true,
    description: 'Share updates and announcements to your Discord server',
    Icon: DiscordIcon,
  },
  x: {
    name: 'x',
    label: 'X',
    color: '#e2e8f0',
    implemented: true,
    description: 'Post tweets and threads to your X audience',
    Icon: XIcon,
  },
  reddit: {
    name: 'reddit',
    label: 'Reddit',
    color: '#FF4500',
    implemented: false,
    description: 'Submit posts to your subreddits',
    Icon: RedditIcon,
  },
  linkedin: {
    name: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    implemented: false,
    description: 'Share professional updates with your network',
    Icon: LinkedInIcon,
  },
}

export const PLATFORM_LIST = Object.values(PLATFORMS)
