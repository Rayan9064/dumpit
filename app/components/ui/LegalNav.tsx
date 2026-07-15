'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function LegalNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold text-slate-900 dark:text-white">DumpIt</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="pill" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
