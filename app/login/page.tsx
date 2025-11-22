'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Auth } from '@/components/Auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 via-indigo-400 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) return null

  return <Auth />
}
