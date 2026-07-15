'use client'

import { Moon, Sun } from 'lucide-react'
import { useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface ThemeToggleProps {
  /**
   * 'icon'  — single icon button (Sun/Moon), clicking animates theme change.
   *           System preference is respected silently; user visible states are light/dark.
   * 'pill'  — compact 3-icon pill (Sun / Monitor / Moon), no View Transition animation.
   *           Kept for sidebar row usage.
   */
  variant?: 'icon' | 'pill'
  className?: string
}

/** Maximum radius needed to cover the entire viewport from any corner. */
function getMaxRadius(x: number, y: number): number {
  const corners = [
    Math.hypot(x, y),
    Math.hypot(window.innerWidth - x, y),
    Math.hypot(x, window.innerHeight - y),
    Math.hypot(window.innerWidth - x, window.innerHeight - y),
  ]
  return Math.max(...corners)
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { resolvedTheme, themeMode, setThemeMode } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const isDark = resolvedTheme === 'dark'

  const handleAnimatedToggle = async () => {
    const nextMode = isDark ? 'light' : 'dark'

    // Fall back to instant toggle if View Transitions not supported
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setThemeMode(nextMode)
      return
    }

    const btn = buttonRef.current
    const rect = btn?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
    const maxRadius = getMaxRadius(x, y)

    const clipFrom = `circle(0px at ${x}px ${y}px)`
    const clipTo = `circle(${maxRadius}px at ${x}px ${y}px)`

    // Set the CSS custom property for the view-transition CSS to pick up
    document.documentElement.style.setProperty('--vt-clip-from', clipFrom)
    document.documentElement.style.setProperty('--vt-clip-to', clipTo)
    document.documentElement.dataset.themeVt = 'active'

    const transition = document.startViewTransition(() => {
      setThemeMode(nextMode)
    })

    transition.finished.finally(() => {
      delete document.documentElement.dataset.themeVt
    })
  }

  if (variant === 'pill') {
    // Compact pill showing all three states explicitly (for sidebar rows / settings)
    const options = [
      { mode: 'light' as const, Icon: Sun, label: 'Light' },
      { mode: 'dark' as const, Icon: Moon, label: 'Dark' },
    ] as const

    return (
      <div
        className={`inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800 ${className}`}
        role="group"
        aria-label="Theme selector"
      >
        {options.map(({ mode, Icon, label }) => {
          const active = themeMode === mode
          return (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              aria-pressed={active}
              aria-label={`${label} mode`}
              title={`${label} mode`}
              className={`relative flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                active
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          )
        })}
      </div>
    )
  }

  // Default: animated icon button (Sun/Moon) with View Transition
  return (
    <button
      ref={buttonRef}
      onClick={handleAnimatedToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
    >
      {/* Sun icon — shown in light mode */}
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      {/* Moon icon — shown in dark mode */}
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  )
}
