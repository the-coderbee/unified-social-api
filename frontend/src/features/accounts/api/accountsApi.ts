import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import type { SocialAccountResponse } from '@/types/api'

interface SocialLoginUrlResponse {
  auth_url: string
  state: string
}

export async function listAccounts(): Promise<SocialAccountResponse[]> {
  const { data } = await api.get<SocialAccountResponse[]>(API_ROUTES.SOCIAL.ACCOUNTS)
  return data
}

export async function getSocialLoginUrl(
  platform: string,
  platformInstance?: string
): Promise<SocialLoginUrlResponse> {
  const { data } = await api.get<SocialLoginUrlResponse>(API_ROUTES.SOCIAL.LOGIN(platform), {
    params: platformInstance ? { platform_instance: platformInstance } : undefined,
  })
  return data
}

export async function linkAccount(
  platform: string,
  code: string,
  state: string,
  platformInstance?: string
): Promise<SocialAccountResponse> {
  const { data } = await api.post<SocialAccountResponse>(
    API_ROUTES.SOCIAL.LINK(platform),
    { code, state, ...(platformInstance && { platform_instance: platformInstance }) },
    { params: platformInstance ? { platform_instance: platformInstance } : undefined }
  )
  return data
}

export async function unlinkAccount(platform: string, platformInstance?: string): Promise<void> {
  await api.delete(API_ROUTES.SOCIAL.UNLINK(platform), {
    params: platformInstance ? { platform_instance: platformInstance } : undefined,
  })
}
