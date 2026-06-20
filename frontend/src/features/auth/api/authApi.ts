import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import type { TokenResponse, UserResponse } from '@/types/api'

export async function getMe(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(API_ROUTES.USERS.ME)
  return data
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await api.post<TokenResponse>(API_ROUTES.AUTH.LOGIN, form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function register(email: string, password: string): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>(API_ROUTES.AUTH.REGISTER, { email, password })
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post(API_ROUTES.AUTH.LOGOUT, { refresh_token: refreshToken })
}

interface OAuthUrlResponse {
  authorization_url: string
  state: string
}

export async function getGoogleAuthUrl(): Promise<OAuthUrlResponse> {
  const { data } = await api.get<OAuthUrlResponse>(API_ROUTES.AUTH.GOOGLE_LOGIN)
  return data
}

export async function getGithubAuthUrl(): Promise<OAuthUrlResponse> {
  const { data } = await api.get<OAuthUrlResponse>(API_ROUTES.AUTH.GITHUB_LOGIN)
  return data
}

export async function handleGoogleCallback(code: string, state: string): Promise<TokenResponse> {
  const { data } = await api.get<TokenResponse>('/api/v1/auth/google/callback', {
    params: { code, state },
  })
  return data
}

export async function handleGithubCallback(code: string, state: string): Promise<TokenResponse> {
  const { data } = await api.get<TokenResponse>('/api/v1/auth/github/callback', {
    params: { code, state },
  })
  return data
}
