'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CollectionsProvider } from '@/contexts/CollectionsContext'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/components/Dashboard'
import { AddResource } from '@/components/AddResource'
import { SharedDump } from '@/components/SharedDump'
import { Profile } from '@/components/Profile'

type Page = 'dashboard' | 'add' | 'shared' | 'profile'

export default function DashboardRoute() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // If not authenticated, don't render anything (effect will redirect)
  if (!user) {
    return null
  }

  // Show dashboard for authenticated users
  return (
    <CollectionsProvider fetchOnMount={true}>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'add' && <AddResource onSuccess={() => setCurrentPage('dashboard')} />}
        {currentPage === 'shared' && <SharedDump />}
        {currentPage === 'profile' && <Profile />}
      </Layout>
    </CollectionsProvider>
  )
}