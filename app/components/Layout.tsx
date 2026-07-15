'use client'

import { Bot, LayoutDashboard, LogOut, Plus, Share2, User } from 'lucide-react'
import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from './ui/ThemeToggle'

type Page = 'dashboard' | 'add' | 'shared' | 'ai' | 'profile'

interface LayoutProps {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems = [
  { id: 'ai', label: 'AI Search', shortLabel: 'Ask', icon: Bot },
  { id: 'dashboard', label: 'Resources', shortLabel: 'Vault', icon: LayoutDashboard },
  { id: 'add', label: 'Capture', shortLabel: 'Add', icon: Plus },
  { id: 'shared', label: 'Shared Dump', shortLabel: 'Shared', icon: Share2 },
  { id: 'profile', label: 'Profile', shortLabel: 'Me', icon: User },
] as const

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white/95 px-4 py-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <img src="/logo.png" alt="DumpIt" className="h-10 w-10 object-contain" />
          <div>
            <div className="text-lg font-bold leading-tight text-slate-950 dark:text-white">DumpIt</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">AI knowledge vault</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-950 dark:bg-blue-950/30">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-200">
            <Bot className="h-4 w-4" />
            Ask your saved internet
          </div>
          <p className="mt-2 text-xs leading-5 text-blue-700/80 dark:text-blue-200/80">
            Search private and shared resources with source-backed answers.
          </p>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors app-focus ${
                  active
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <ThemeToggle variant="row" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DumpIt" className="h-9 w-9 object-contain" />
            <div>
              <div className="text-sm font-bold text-slate-950 dark:text-white">DumpIt</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">AI knowledge vault</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle variant="pill" />
            <button onClick={signOut} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/30 dark:hover:text-red-300" aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 pt-5 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.shortLabel}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
