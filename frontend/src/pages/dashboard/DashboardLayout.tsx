import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  Key,
  Share2,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth, useLogout } from "@/features/auth/hooks/useAuth";
import Avatar from "@/components/Avatar";
import { truncateEmail } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/platforms", label: "Platforms", icon: Layers },
  { to: "/dashboard/api-keys", label: "API Keys", icon: Key },
] as const;

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { user } = useAuth();
  const { mutate: logout, isPending: loggingOut } = useLogout();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-linear-270-to-br from-accent-from to-accent-to flex items-center justify-center shrink-0">
            <Share2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">
            <span className="gradient-text">Unified</span>
            <span className="text-text-primary"> Social API</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNav}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface-2 text-text-primary border-l-2 border-accent pl-2.5"
                      : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 mb-1">
          <Avatar email={user?.email ?? ""} size="sm" />
          <span className="text-xs text-text-secondary flex-1 truncate">
            {truncateEmail(user?.email ?? "", 20)}
          </span>
        </div>
        <button
          onClick={() => logout()}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-tertiary transition-colors hover:bg-surface-2 hover:text-error disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-0">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface-1 fixed top-0 left-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-surface-1 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-linear-to-br from-accent-from to-accent-to flex items-center justify-center">
            <Share2 className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-sm">
            <span className="gradient-text">Unified</span>
            <span className="text-text-primary"> Social API</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="md:hidden fixed top-0 left-0 h-full w-60 z-50 bg-surface-1 border-r border-border"
            >
              <SidebarContent onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-60 min-h-screen pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
