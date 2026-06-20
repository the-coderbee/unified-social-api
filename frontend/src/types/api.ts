export type AuthProvider = 'google' | 'github' | 'local'

export type PostStatus = 'PENDING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'

export type PostResultStatus = 'SUCCESS' | 'FAILED'

export type PlatformName = 'mastodon' | 'linkedin' | 'discord' | 'x'

export interface SocialAccountResponse {
  platform: string
  provider_account_id: string
  username: string | null
  global_name: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface UserResponse {
  id: string
  email: string
  is_active: boolean
  is_superuser: boolean
  auth_provider: AuthProvider
  social_accounts: SocialAccountResponse[]
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface PostPlatformResult {
  platform_name: string
  status: PostResultStatus
  post_url: string | null
  error_message: string | null
  created_at: string
}

export interface PostResponse {
  id: string
  content: string
  status: PostStatus
  created_at: string
  results: PostPlatformResult[]
  not_connected_platforms: string[]
}

export interface APIKeyResponse {
  id: string
  name: string
  scopes: string[]
  key_prefix: string
  is_active: boolean
  created_at: string
}

export interface APIKeyCreateResponse extends APIKeyResponse {
  api_key: string
}

export interface APIKeyCreate {
  name: string
  scopes: string[]
}
