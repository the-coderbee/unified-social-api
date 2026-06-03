import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface-0 flex">
      <Sidebar />
      <main className="flex-1 ml-56 p-8 min-h-screen overflow-y-auto max-w-[calc(100%-224px)]">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
