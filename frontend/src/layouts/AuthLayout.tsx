import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px]">
        <Outlet />
      </div>
    </div>
  )
}
