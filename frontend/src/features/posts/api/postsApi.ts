import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import type { PostResponse, PostStatus } from '@/types/api'

export async function listPosts(status?: PostStatus): Promise<PostResponse[]> {
  const { data } = await api.get<PostResponse[]>(API_ROUTES.POSTS.LIST, {
    params: status ? { status } : undefined,
  })
  return data
}

export async function getPost(id: string): Promise<PostResponse> {
  const { data } = await api.get<PostResponse>(API_ROUTES.POSTS.GET(id))
  return data
}

export async function retryPost(id: string): Promise<PostResponse> {
  const { data } = await api.post<PostResponse>(API_ROUTES.POSTS.RETRY(id))
  return data
}
