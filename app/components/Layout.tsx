'use client'

import { LayoutDashboard, LogOut, Moon, Plus, Share2, Sun, User, Menu, X } from 'lucide-react';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'add' | 'shared' | 'profile';
  onNavigate: (page: 'dashboard' | 'add' | 'shared' | 'profile') => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      // move keyboard focus to first menu item
      firstMenuItemRef.current?.focus();
    } else {
      // restore focus to the toggle button when the menu closes
      toggleButtonRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Resource', icon: Plus },
    { id: 'shared', label: 'Shared Dump', icon: Share2 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="DumpIt Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                DumpIt
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Header Controls */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                onClick={() => setIsMobileMenuOpen((s) => !s)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={toggleButtonRef}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          id="mobile-menu"
          className={`md:hidden border-t border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-72 pointer-events-auto' : 'max-h-0 pointer-events-none'
          }`}
          aria-hidden={!isMobileMenuOpen}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="bg-white dark:bg-gray-800 px-4 py-3 grid grid-cols-2 gap-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  ref={index === 0 ? firstMenuItemRef : undefined}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              tabIndex={isMobileMenuOpen ? 0 : -1}
              role="menuitem"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>

      </nav>

      {/* Click overlay for mobile menu to close when clicking outside */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/20 transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
          style={{ pointerEvents: 'auto' }}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-4 relative z-0">
        {children}
      </main>
    </div>
  );
}
