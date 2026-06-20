import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { APIKeyResponse } from '@/types/api'
import { createApiKey, listApiKeys, revokeApiKey } from '../api/apiKeysApi'

export const API_KEYS_QUERY_KEY = ['api-keys'] as const

export function useApiKeys() {
  return useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: listApiKeys,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, scopes }: { name: string; scopes: string[] }) =>
      createApiKey(name, scopes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
    },
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: API_KEYS_QUERY_KEY })
      const previous = queryClient.getQueryData<APIKeyResponse[]>(API_KEYS_QUERY_KEY)
      queryClient.setQueryData<APIKeyResponse[]>(API_KEYS_QUERY_KEY, (old) =>
        old?.map((k) => (k.id === id ? { ...k, is_active: false } : k)) ?? []
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(API_KEYS_QUERY_KEY, ctx.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
    },
  })
}
