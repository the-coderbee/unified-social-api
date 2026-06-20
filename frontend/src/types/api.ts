export type AuthProvider = 'google' | 'github' | 'local'

export type PlatformName = 'mastodon' | 'linkedin' | 'discord' | 'x'

export interface SocialAccountResponse {
  platform: string
  platform_instance: string | null
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
