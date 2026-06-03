import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useMe } from '@/features/auth/api/authApi'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  badge?: string
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )
}

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

const navItems: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: <GridIcon /> },
  { label: 'Accounts', to: '/dashboard/accounts', icon: <LinkIcon /> },
  { label: 'Compose', to: '/dashboard/compose', icon: <PenIcon />, badge: 'Soon' },
  { label: 'Posts', to: '/dashboard/posts', icon: <FileIcon />, badge: 'Soon' },
]

export function Sidebar() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-surface-1 border-r border-surface-2 flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-2">
        <span className="font-bold text-base tracking-tight text-text-primary">
          Unified
        </span>
        <span className="text-accent font-bold text-base">.</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-surface-2 rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 shrink-0">{item.icon}</span>
                <span className="relative z-10 flex-1">{item.label}</span>
                {item.badge && (
                  <AnimatePresence>
                    <span className="relative z-10 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-3 text-text-tertiary">
                      {item.badge}
                    </span>
                  </AnimatePresence>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + actions */}
      <div className="px-3 pb-4 border-t border-surface-2 pt-3 flex flex-col gap-2">
        <ThemeToggle className="self-end mb-1" />
        {user && (
          <div className="px-2 mb-1">
            <p className="text-xs text-text-tertiary truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-error/10 transition-colors w-full cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
