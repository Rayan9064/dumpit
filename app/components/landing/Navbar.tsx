'use client'

import { ArrowRight, Github, Star, Zap } from 'lucide-react'
import Link from '../ui/Link'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const GITHUB_REPO = 'Rayan9064/dumpit'

const Navbar = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stargazers_count !== undefined) setStars(data.stargazers_count)
      })
      .catch(() => {})
  }, [])

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold text-zinc-900 dark:text-white">DumpIt</span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
          <a href="#how-it-works" className="transition hover:text-zinc-950 dark:hover:text-white">How it works</a>
          <a href="#platform" className="transition hover:text-zinc-950 dark:hover:text-white">Platform</a>
          <a href="#pricing" className="transition hover:text-zinc-950 dark:hover:text-white">Pricing</a>
          <a href="#api" className="transition hover:text-zinc-950 dark:hover:text-white">API</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star DumpIt on GitHub"
            className="hidden items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white sm:inline-flex"
          >
            <Github className="h-4 w-4" />
            {stars !== null && (
              <span className="flex items-center gap-1 text-xs font-semibold">
                <Star className="h-3 w-3" />
                {stars}
              </span>
            )}
          </a>
          <ThemeToggle variant="icon" />
          {user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Open app <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:inline-flex"
              >
                Sign in
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Zap className="h-3.5 w-3.5" />
                Get Founding Access
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">50% OFF</span>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
