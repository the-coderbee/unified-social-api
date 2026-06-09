import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Toast } from '@/components/Toast'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OverviewPage from '@/pages/dashboard/OverviewPage'
import AccountsPage from '@/pages/dashboard/AccountsPage'
import OAuthCallbackPage from '@/pages/dashboard/OAuthCallbackPage'
import ComposePage from '@/pages/dashboard/ComposePage'
import PostsPage from '@/pages/dashboard/PostsPage'
import GoogleCallbackPage from '@/pages/GoogleCallbackPage'
import GitHubCallbackPage from '@/pages/GitHubCallbackPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={
          <GuestOnlyRoute>
            <LandingPage />
          </GuestOnlyRoute>
        } />

        <Route
          element={
            <GuestOnlyRoute>
              <AuthLayout />
            </GuestOnlyRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="accounts/callback/:platform" element={<OAuthCallbackPage />} />
          <Route path="compose" element={<ComposePage />} />
          <Route path="posts" element={<PostsPage />} />
        </Route>

        <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />
        <Route path="/auth/callback/github" element={<GitHubCallbackPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
