export interface SocialAccount {
  platform: string
  provider_account_id: string
}

export interface AuthUrlResponse {
  auth_url: string
}

export interface LinkAccountPayload {
  code: string
  state: string
}

export interface LinkAccountResponse {
  status: string
  message: string
}
