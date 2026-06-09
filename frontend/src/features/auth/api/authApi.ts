import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import type { User, AuthTokenResponse, GoogleLoginResponse } from '../types/auth.types'

export const loginFetcher = async (email: string, password: string) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const res = await api.post<AuthTokenResponse>('/users/login', form)
  return res.data
}

export const registerFetcher = async (email: string, password: string) => {
  const res = await api.post<User>('/users/register', { email, password })
  return res.data
}

export const getMeFetcher = async () => {
  const res = await api.get<User>('/users/me')
  return res.data
}

export function useLogin() {
  const { setToken } = useAuthStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginFetcher(email, password),
    onSuccess: async (data) => {
      setToken(data.access_token)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
    onError: () => {
      addToast('Invalid email or password', 'error')
    },
  })
}

export function useRegister() {
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      registerFetcher(email, password),
    onSuccess: () => {
      addToast('Account created — sign in to continue', 'success')
      navigate('/login')
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const msg = error.response?.data?.detail ?? 'Registration failed'
      addToast(msg, 'error')
    },
  })
}

export const googleLoginFetcher = async () => {
  const res = await api.post<GoogleLoginResponse>('/auth/google/login')
  return res.data
}

export const googleCallbackFetcher = async (code: string, state: string) => {
  const res = await api.post<AuthTokenResponse>('/auth/google/callback', null, {
    params: { code, state },
  })
  return res.data
}

export function useGoogleLogin() {
  const { addToast } = useToastStore()

  return useMutation({
    mutationFn: googleLoginFetcher,
    onSuccess: (data) => {
      sessionStorage.setItem('google_oauth_state', data.state)
      window.location.href = data.authorization_url
    },
    onError: () => {
      addToast('Failed to initialize Google sign-in', 'error')
    },
  })
}

export function useGoogleCallback() {
  const { setToken } = useAuthStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      googleCallbackFetcher(code, state),
    onSuccess: async (data) => {
      sessionStorage.removeItem('google_oauth_state')
      setToken(data.access_token)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      sessionStorage.removeItem('google_oauth_state')
      const msg = error.response?.data?.detail ?? 'Google sign-in failed'
      addToast(msg, 'error')
      navigate('/login')
    },
  })
}

export function useMe() {
  const token = useAuthStore((s) => s.token)
  const { setUser } = useAuthStore()

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const user = await getMeFetcher()
      setUser(user)
      return user
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  })
}
