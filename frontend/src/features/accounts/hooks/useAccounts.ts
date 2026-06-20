import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SocialAccountResponse } from '@/types/api'
import { linkAccount, listAccounts, unlinkAccount } from '../api/accountsApi'

export const ACCOUNTS_QUERY_KEY = ['social-accounts'] as const

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: listAccounts,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLinkAccount(options?: {
  onSuccess?: (account: SocialAccountResponse) => void
  onError?: (error: unknown) => void
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      platform,
      code,
      state,
      platformInstance,
    }: {
      platform: string
      code: string
      state: string
      platformInstance?: string
    }) => linkAccount(platform, code, state, platformInstance),
    // Hook-level callbacks run even if the caller unmounts before the mutation
    // settles — per-call mutate() callbacks do NOT, and StrictMode's mount→
    // unmount→mount cycle drops them, which left the callback page stuck.
    onSuccess: (newAccount) => {
      // Seed cache even when empty (post-OAuth full-page reload wipes QueryClient)
      queryClient.setQueryData<SocialAccountResponse[]>(ACCOUNTS_QUERY_KEY, (old) =>
        old ? [...old, newAccount] : [newAccount]
      )
      // Mark stale so PlatformsPage's observer triggers a background server sync
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      options?.onSuccess?.(newAccount)
    },
    onError: (error) => options?.onError?.(error),
  })
}

export function useUnlinkAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (platform: string) => unlinkAccount(platform),
    onSuccess: (_, platform) => {
      queryClient.setQueryData<SocialAccountResponse[]>(ACCOUNTS_QUERY_KEY, (old) =>
        old ? old.filter((a) => a.platform !== platform) : []
      )
    },
  })
}
