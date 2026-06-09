export interface User {
  id: string
  email: string
  is_active: boolean
  social_accounts: Array<{ platform: string; provider_account_id: string }>
}

export interface AuthTokenResponse {
  access_token: string
  token_type: string
}

export interface GoogleLoginResponse {
  authorization_url: string
  state: string
}

export interface GithubLoginResponse {
  authorization_url: string
  state: string
}
