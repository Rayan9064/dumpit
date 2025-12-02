'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardPage from '@/app-pages/DashboardPage'
import { CollectionsProvider } from '@/contexts/CollectionsContext'

export default function DashboardRoute() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (effect will redirect)
  if (!user) {
    return null
  }

  // Show dashboard for authenticated users — collections provider only here
  return (
    <CollectionsProvider>
      <DashboardPage />
    </CollectionsProvider>
  )
}