import { Navigate } from 'react-router-dom'
import { tokenStorage } from '@/lib/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!tokenStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
