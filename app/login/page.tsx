'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Auth } from '@/components/Auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500/80 via-indigo-400/80 to-purple-600/80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render anything (effect will redirect)
  if (user) {
    return null
  }

  // Responsive Fullscreen login with advanced background & centering
  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-500/80 via-indigo-400/80 to-purple-600/80 flex items-center justify-center">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-xl px-2 sm:px-4 flex flex-col justify-center items-center h-full">
          <Auth />
        </div>
      </div>
    </div>
  )
}
