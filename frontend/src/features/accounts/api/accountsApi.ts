import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useToastStore } from '@/store/toastStore'
import type { AuthUrlResponse, LinkAccountPayload, LinkAccountResponse } from '../types/accounts.types'

export const getAuthUrl = async (platform: string): Promise<AuthUrlResponse> => {
  const res = await api.get<AuthUrlResponse>(`/social/login/${platform}`)
  return res.data
}

export const linkAccountFetcher = async (
  platform: string,
  payload: LinkAccountPayload
): Promise<LinkAccountResponse> => {
  const res = await api.post<LinkAccountResponse>(`/social/${platform}/link`, payload)
  return res.data
}

export function useLinkAccount(platform: string) {
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LinkAccountPayload) => linkAccountFetcher(platform, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      addToast(data.message || `${platform} connected successfully`, 'success')
      navigate('/dashboard/accounts')
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const msg = error.response?.data?.detail ?? 'Failed to connect account'
      addToast(msg, 'error')
      navigate('/dashboard/accounts')
    },
  })
}
