'use client'

import { Bot, CheckCircle2, Eye, EyeOff, Loader2, LogIn, ShieldCheck, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuthProps {
  defaultIsLogin?: boolean
}

const usernameRegex = /^[a-z0-9_-]{3,20}$/

const getFriendlyErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-not-found':
      return 'No account found with this email. Try signing up instead.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.'
    default:
      return 'An error occurred. Please try again.'
  }
}

export function Auth({ defaultIsLogin = true }: AuthProps) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const searchParams = useSearchParams()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  useEffect(() => {
    const signupParam = searchParams?.get('signup')
    if (signupParam === 'true') setIsLogin(false)
    if (signupParam === 'false') setIsLogin(true)
  }, [searchParams])

  const checkUsernameUniqueness = async (value: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`)
      const data = await response.json()
      return data.available
    } catch (err) {
      console.error('Error checking username:', err)
      return false
    }
  }

  const generateUsernameSuggestions = (base: string): string[] => {
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.floor(Math.random() * 1000)
    return [
      `${base}${timestamp}`,
      `${base}_${random}`,
      `${base}-${random}`,
      `the_${base}`,
      `${base}_ai`,
    ].slice(0, 5)
  }

  const handleUsernameChange = async (value: string) => {
    setUsername(value)
    setUsernameError('')
    setUsernameSuggestions([])

    if (value.trim() === '') return

    if (!usernameRegex.test(value)) {
      setUsernameError('Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.')
      return
    }

    const isAvailable = await checkUsernameUniqueness(value)
    if (!isAvailable) {
      setUsernameError('This username is already taken.')
      setUsernameSuggestions(generateUsernameSuggestions(value))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password)
        if (signInError) setError(getFriendlyErrorMessage(signInError.code || ''))
      } else {
        if (!usernameRegex.test(username)) {
          setError('Please enter a valid username.')
          return
        }

        const isAvailable = await checkUsernameUniqueness(username)
        if (!isAvailable) {
          setError('Username is already taken. Please choose another.')
          return
        }

        const { error: signUpError } = await signUp(email, password, username)
        if (signUpError) setError(getFriendlyErrorMessage(signUpError.code || ''))
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      const { error: googleError } = await signInWithGoogle()
      if (googleError) setError(getFriendlyErrorMessage(googleError.code || ''))
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 md:grid-cols-[0.9fr_1.1fr]">
      <aside className="hidden bg-slate-950 p-8 text-white md:flex md:flex-col md:justify-between">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <Image src="/logo.png" alt="DumpIt logo" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold">DumpIt</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-normal">Your saved internet, ready to answer back.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Save resources, index links, ask questions, and verify answers with source cards.
          </p>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-3"><Bot className="h-4 w-4 text-blue-300" /> AI answers over indexed resources</div>
          <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Private by default</div>
          <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-teal-300" /> Citations you can inspect</div>
        </div>
      </aside>

      <div className="p-6 sm:p-8">
        <div className="mb-8 md:hidden">
          <Image src="/logo.png" alt="DumpIt logo" width={56} height={56} className="mb-3 h-14 w-14 object-contain" />
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">DumpIt</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI knowledge vault for saved links</p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{isLogin ? 'Welcome back' : 'Create your vault'}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? 'Continue to your AI knowledge workspace.' : 'Start saving links and asking better questions.'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${isLogin ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${!isLogin ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="app-label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => handleUsernameChange(event.target.value.toLowerCase())}
                className="app-input"
                placeholder="choose_a_username"
                required={!isLogin}
              />
              {usernameError && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{usernameError}</p>}
              {usernameSuggestions.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-sm text-slate-600 dark:text-slate-300">Try these instead:</p>
                  <div className="flex flex-wrap gap-1">
                    {usernameSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleUsernameChange(suggestion)}
                        className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="app-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="app-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="app-label">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="app-input pr-12"
                placeholder="Password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={(event) => {
                  event.preventDefault()
                  setShowPassword(!showPassword)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? <><LogIn className="h-5 w-5" /> Sign In</> : <><UserPlus className="h-5 w-5" /> Create Account</>}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="mx-4 flex-shrink text-sm text-slate-500 dark:text-slate-400">or continue with</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
