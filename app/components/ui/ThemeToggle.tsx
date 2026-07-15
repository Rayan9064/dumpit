'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemeMode } from '../../contexts/ThemeContext'

const options: { mode: ThemeMode; Icon: typeof Sun; label: string }[] = [
  { mode: 'light', Icon: Sun, label: 'Light mode' },
  { mode: 'system', Icon: Monitor, label: 'System mode' },
  { mode: 'dark', Icon: Moon, label: 'Dark mode' },
]

interface ThemeToggleProps {
  /** 'pill' = compact 3-icon pill (default for navbars). 'row' = full-width row items for sidebars. */
  variant?: 'pill' | 'row'
  className?: string
}

export function ThemeToggle({ variant = 'pill', className = '' }: ThemeToggleProps) {
  const { themeMode, setThemeMode } = useTheme()

  if (variant === 'row') {
    return (
      <div className={`space-y-0.5 ${className}`}>
        {options.map(({ mode, Icon, label }) => {
          const active = themeMode === mode
          return (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              aria-pressed={active}
              aria-label={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Pill variant
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
            aria-label={label}
            title={label}
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
