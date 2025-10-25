'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { CollectionsProvider } from '@/contexts/CollectionsContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ReactNode } from 'react'

export function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CollectionsProvider>
          {children}
        </CollectionsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
