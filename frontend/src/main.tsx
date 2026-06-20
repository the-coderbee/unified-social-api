import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import './index.css'
import App from './App'

// Keep cached data in memory long enough for the persisted copy to stay useful.
// gcTime must be >= persistence maxAge or restored entries get garbage-collected.
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000 // 24h

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      gcTime: CACHE_MAX_AGE,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        // No response = timeout/network error. It already consumed the full
        // timeout budget; retrying just doubles the user-visible wait, so fail fast.
        if (status === undefined) return false
        if (status === 429) return false
        return failureCount < 1
      },
    },
  },
})

// Persist the query cache to localStorage so the full-page OAuth redirect
// cold-boots with a warm cache instead of an empty one (no skeleton/buffer flash).
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'usa-query-cache',
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        // Bump when the cache shape changes to discard stale persisted data.
        buster: 'v1',
        dehydrateOptions: {
          // Only persist settled successful queries — never errored/loading state.
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        },
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>
)
