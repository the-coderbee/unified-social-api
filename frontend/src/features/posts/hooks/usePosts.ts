import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PostStatus } from '@/types/api'
import { listPosts, retryPost } from '../api/postsApi'

export const POSTS_QUERY_KEY = (status?: PostStatus) =>
  status ? ['posts', status] : ['posts']

export function usePosts(status?: PostStatus) {
  return useQuery({
    queryKey: POSTS_QUERY_KEY(status),
    queryFn: () => listPosts(status),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useRetryPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => retryPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
