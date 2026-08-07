'use client'

import { useAuth } from '../contexts/AuthContext'
import { Auth } from '../components/Auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function LoginPageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard (or the requested page)
    if (!loading && user) {
      const next = searchParams.get('next')
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')
    }
  }, [user, loading, router, searchParams])

  if (loading) {
    return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-300">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render anything (effect will redirect)
  if (user) {
    return null
  }

  // Show login component for unauthenticated users
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl">
        <Auth />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
