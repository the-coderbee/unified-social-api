import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { tokenStorage } from '@/lib/api'
import type { TokenResponse, UserResponse } from '@/types/api'
import {
  getMe,
  login,
  logout,
  register,
  handleGoogleCallback,
  handleGithubCallback,
} from '../api/authApi'

export const AUTH_QUERY_KEY = ['auth', 'me'] as const

export function useAuth() {
  const hasToken = tokenStorage.isAuthenticated()

  const { data: user, isLoading } = useQuery<UserResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getMe,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return {
    user: user ?? null,
    isAuthenticated: Boolean(user),
    isLoading: hasToken && isLoading,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<TokenResponse, Error, { email: string; password: string }>({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      tokenStorage.setTokens(data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      navigate('/dashboard')
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<void, Error, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      await register(email, password)
      const tokens = await login(email, password)
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      navigate('/dashboard')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        await logout(refreshToken).catch(() => {})
      }
    },
    onSuccess: () => {
      tokenStorage.clearTokens()
      queryClient.clear()
      navigate('/')
    },
    onError: () => {
      tokenStorage.clearTokens()
      queryClient.clear()
      navigate('/')
    },
  })
}

type OAuthProvider = 'google' | 'github'

export function useOAuthCallback(provider: OAuthProvider) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<TokenResponse, Error, { code: string; state: string }>({
    mutationFn: ({ code, state }) =>
      provider === 'google'
        ? handleGoogleCallback(code, state)
        : handleGithubCallback(code, state),
    onSuccess: (data) => {
      tokenStorage.setTokens(data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      navigate('/dashboard')
    },
    onError: () => {
      navigate('/login?error=oauth_failed')
    },
  })
}
