import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import AuthPage from './pages/auth/AuthPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import OverviewPage from './pages/dashboard/OverviewPage'
import PostsPage from './pages/dashboard/PostsPage'
import PlatformsPage from './pages/dashboard/PlatformsPage'
import ApiKeysPage from './pages/dashboard/ApiKeysPage'
import OAuthCallbackHandler from './features/auth/components/OAuthCallbackHandler'
import SocialCallbackHandler from './features/accounts/components/SocialCallbackHandler'
import ProtectedRoute from './components/ProtectedRoute'
import DocsPage, { DocsSectionRenderer } from './pages/docs/DocsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage initialTab="login" />} />
        <Route path="/register" element={<AuthPage initialTab="register" />} />
        <Route path="/auth/callback/google" element={<OAuthCallbackHandler provider="google" />} />
        <Route path="/auth/callback/github" element={<OAuthCallbackHandler provider="github" />} />

        {/* Docs */}
        <Route path="/docs" element={<DocsPage />}>
          <Route index element={<Navigate to="/docs/introduction" replace />} />
          <Route path=":section" element={<DocsSectionRenderer />} />
        </Route>

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="platforms" element={<PlatformsPage />} />
          <Route path="api-keys" element={<ApiKeysPage />} />
          <Route path="accounts/callback/:platform" element={<SocialCallbackHandler />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
