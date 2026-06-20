import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import type { APIKeyCreateResponse, APIKeyResponse } from '@/types/api'

export async function listApiKeys(): Promise<APIKeyResponse[]> {
  const { data } = await api.get<APIKeyResponse[]>(API_ROUTES.API_KEYS.LIST)
  return data
}

export async function createApiKey(name: string, scopes: string[]): Promise<APIKeyCreateResponse> {
  const { data } = await api.post<APIKeyCreateResponse>(API_ROUTES.API_KEYS.CREATE, {
    name,
    scopes,
  })
  return data
}

export async function revokeApiKey(id: string): Promise<void> {
  await api.patch(API_ROUTES.API_KEYS.REVOKE(id))
}
