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

  // Loading spinner (fullscreen, responsive)
  if (loading) {
    return (
<<<<<<< HEAD
      <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500/80 via-indigo-400/80 to-purple-600/80">
=======
      <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500/80 via-indigo-400/80 to-purple-600/80">
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-t-4 border-blue-300 border-t-blue-600 mx-auto mb-5"></div>
          <p className="text-blue-700 font-semibold text-lg drop-shadow">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render anything (effect will redirect)
  if (user) return null

<<<<<<< HEAD
  // Main login page layout (centered)
  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-500/80 via-indigo-400/80 to-purple-600/80 flex items-center justify-center px-2">
      <Auth />
=======
  // Responsive Fullscreen login with advanced background & centering
  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-500/80 via-indigo-400/80 to-purple-600/80 flex items-center justify-center">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-xl px-2 sm:px-4 flex flex-col justify-center items-center h-full">
          <Auth />
        </div>
      </div>
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
    </div>
  )
}
