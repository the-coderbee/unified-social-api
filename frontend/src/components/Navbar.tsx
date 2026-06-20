import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Share2, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth, useLogout } from '@/features/auth/hooks/useAuth'
import { NAV_LINKS } from '@/lib/constants'
import { truncateEmail } from '@/lib/utils'
import Button from './Button'
import Avatar from './Avatar'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, isLoading } = useAuth()
  const { mutate: logout, isPending: loggingOut } = useLogout()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <motion.div
          animate={{
            backgroundColor: scrolled ? 'rgba(3,3,3,0.88)' : 'rgba(3,3,3,0)',
            borderBottomColor: scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)',
          }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="border-b"
          style={{ backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none' }}
        >
          <nav className="container-content h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Unified Social API home">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-from to-accent-to flex items-center justify-center shrink-0">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight">
                <span className="gradient-text">Unified</span>
                <span className="text-text-primary"> Social API</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-2 inline-block"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <motion.a
                      href={link.href}
                      whileHover={{ color: 'var(--color-text-primary)' }}
                      transition={{ duration: 0.15 }}
                      className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </motion.a>
                  )}
                </li>
              ))}
            </ul>

            {/* Desktop auth section */}
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-surface-2 animate-pulse" />
                  <div className="w-28 h-3 rounded bg-surface-2 animate-pulse" />
                </div>
              ) : user ? (
                <div ref={userMenuRef} className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: 'var(--color-surface-2)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    <Avatar email={user.email} size="sm" />
                    <span className="text-sm text-text-secondary">{truncateEmail(user.email)}</span>
                    <ChevronDown
                      className="h-3.5 w-3.5 text-text-tertiary transition-transform"
                      style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-surface-1 py-1.5 overflow-hidden"
                        style={{ boxShadow: 'var(--shadow-card)' }}
                      >
                        <button
                          role="menuitem"
                          onClick={() => { setUserMenuOpen(false); navigate('/dashboard') }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </button>
                        <div className="my-1 h-px bg-border mx-3" />
                        <button
                          role="menuitem"
                          onClick={() => { setUserMenuOpen(false); logout() }}
                          disabled={loggingOut}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-error disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {loggingOut ? 'Signing out…' : 'Sign out'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Get Started</Button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </nav>
        </motion.div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="overflow-hidden md:hidden"
              style={{
                background: 'rgba(3,3,3,0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="container-content py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) =>
                  link.isRoute ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2 transition-colors block"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.18 }}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2 transition-colors"
                    >
                      {link.label}
                    </motion.a>
                  ),
                )}

                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2.5 px-4 py-2">
                        <Avatar email={user.email} size="sm" />
                        <span className="text-sm text-text-secondary">{truncateEmail(user.email)}</span>
                      </div>
                      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" size="md" className="w-full justify-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full justify-center gap-2"
                        onClick={() => { setMobileOpen(false); logout() }}
                        disabled={loggingOut}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" size="md" className="w-full justify-center">Sign In</Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        <Button variant="primary" size="md" className="w-full justify-center">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
