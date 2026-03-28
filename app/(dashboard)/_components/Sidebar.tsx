'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  PackageOpen,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Navigation items for the sidebar.
 * Each entry maps a label + icon to a route.
 */
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  orgName: string
}

/**
 * Sidebar — client component so we can use usePathname() for active link
 * highlighting and useRouter() for post-logout redirect.
 *
 * Receives orgName as a prop from the server layout (avoids a client-side fetch).
 */
export default function Sidebar({ orgName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo + org name */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
          <PackageOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">StockFlow</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">{orgName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout at the bottom */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
