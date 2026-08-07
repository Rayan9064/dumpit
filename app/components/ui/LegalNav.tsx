'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function LegalNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold text-zinc-900 dark:text-white">DumpIt</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
