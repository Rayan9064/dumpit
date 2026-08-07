'use client'

import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ReactNode, useEffect } from 'react'
import { initializeTelemetry } from './lib/telemetry'
import { ToastProvider } from './components/ui/Toast'

export function RootLayoutClient({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializeTelemetry()
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
