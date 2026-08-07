'use client'

import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

type ToastVariant = 'success' | 'warning' | 'error'

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: 'app-chip-success',
  warning: 'app-chip-warning',
  error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, variant: ToastVariant = 'error') => {
    const id = nextId++
    setToasts((current) => [...current, { id, variant, message }])
    setTimeout(() => dismissToast(id), 5000)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`app-panel pointer-events-auto flex items-start gap-2.5 border p-3.5 text-sm shadow-lg ${variantStyles[toast.variant]}`}
          >
            {toast.variant === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 opacity-60 transition hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
