'use client'

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Auth } from '../components/Auth';
import { Layout } from '../components/Layout';
import { Dashboard } from '../components/Dashboard';
import { AddResource } from '../components/AddResource';
import { SharedDump } from '../components/SharedDump';
import { Profile } from '../components/Profile';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from '@/contexts/ThemeContext';

type Page = 'dashboard' | 'add' | 'shared' | 'profile';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // If not authenticated, show Auth component
  if (!user) {
    return <Auth />;
  }

  // User is authenticated, show dashboard
  return (
    <ThemeProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage  === 'add' && <AddResource onSuccess={() => setCurrentPage('dashboard')} />}
        {currentPage === 'shared' && <SharedDump />}
        {currentPage === 'profile' && <Profile />}
      </Layout>
    </ThemeProvider>
  );
};

export default DashboardPage;
