"use client"

import type React from "react"
import { Loader2, Mail, Lock, Eye, EyeOff, User, LogIn, UserPlus } from "lucide-react"
import { useState, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const usernameRegex = /^[a-z0-9_-]{3,20}$/

  const getFriendlyErrorMessage = (errorCode: string): string => {
    const errorMap: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered. Try signing in instead.",
      "auth/weak-password": "Password should be at least 6 characters long.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-not-found": "No account found with this email. Please sign up first.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/too-many-requests": "Too many failed attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Please check your connection and try again.",
      "auth/user-disabled": "This account has been disabled. Please contact support.",
    }
    return errorMap[errorCode] || "An unexpected error occurred. Please try again."
  }

  const validateUsernameFormat = (username: string): boolean => {
    return usernameRegex.test(username)
  }

  const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) return false
      const data = await response.json()
      return data.available
    } catch (error) {
      return false
    }
  }

  const generateUsernameSuggestions = (baseUsername: string): string[] => {
    const suggestions: string[] = []
    const cleanBase = baseUsername.replace(/[^a-z0-9_-]/g, "").toLowerCase()

    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${cleanBase}${i}`)
    }

    for (let i = 1; i <= 3; i++) {
      suggestions.push(`${cleanBase}_${i}`)
    }

    return suggestions.slice(0, 5)
  }

  const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const debouncedCheckUsername = useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) {
        setIsCheckingUsername(false)
        return
      }

      if (!validateUsernameFormat(value)) {
        setUsernameError("Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.")
        setIsCheckingUsername(false)
        return
      }

      const isAvailable = await checkUsernameUniqueness(value)
      if (!isAvailable) {
        setUsernameError("This username is already taken.")
        const suggestions = generateUsernameSuggestions(value)
        setUsernameSuggestions(suggestions)
      }
      setIsCheckingUsername(false)
    }, 500),
    [],
  )

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setUsernameError("")
    setUsernameSuggestions([])

    if (value.trim() === "") return

    setIsCheckingUsername(true)
    debouncedCheckUsername(value)
  }

  const handleTabChange = (newIsLogin: boolean) => {
    setIsLogin(newIsLogin)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setError(getFriendlyErrorMessage(error.code || ""))
          setLoading(false)
        }
      } else {
        if (!username.trim()) {
          setError("Username is required")
          setLoading(false)
          return
        }

        if (!validateUsernameFormat(username)) {
          setError("Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.")
          setLoading(false)
          return
        }

        const isAvailable = await checkUsernameUniqueness(username)
        if (!isAvailable) {
          setError("This username is already taken. Please choose a different one.")
          setLoading(false)
          return
        }

        const { error } = await signUp(email, password, username)
        if (error) {
          setError(getFriendlyErrorMessage(error.code || ""))
          setLoading(false)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setGoogleLoading(true)

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(getFriendlyErrorMessage(error.code || "") || "Failed to sign in with Google")
      }
    } catch (err) {
      setError("An unexpected error occurred with Google sign-in. Please try again.")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 overflow-hidden">
              <img
                src="https://i.ibb.co/gLWmwm49/logo-with-text.png"
                alt="DumpIt Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">DumpIt</h1>
            <p className="text-blue-100 text-sm">Your Personal Resource Vault</p>
          </div>

          <div className="p-8">
            {/* Tabs */}
            {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                isLogin
                ? "bg-blue-600 text-white shadow-md" // active = blue
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50" // inactive = gray/hover-blue
              }`}
              aria-selected={isLogin}
              role="tab"
            >
              <LogIn className="w-4 h-4 inline-block mr-2" />
              Login
            </button>
          <button
    type="button"
    onClick={() => handleTabChange(false)}
    className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
      !isLogin
        ? "bg-blue-600 text-white shadow-md" // active = blue
        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50" // inactive = gray/hover-blue
    }`}
    aria-selected={!isLogin}
    role="tab"
  >
    <UserPlus className="w-4 h-4 inline-block mr-2" />
    Sign Up
        </button>
      </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="johndoe"
                      className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all ${
                        usernameError ? "border-destructive" : "border-input"
                      }`}
                      aria-invalid={!!usernameError}
                      aria-describedby={usernameError ? "username-error" : "username-helper"}
                    />
                  </div>
                  {usernameError && (
                    <p id="username-error" className="mt-2 text-sm text-destructive">
                      {usernameError}
                    </p>
                  )}
                  {!usernameError && (
                    <p id="username-helper" className="mt-2 text-sm text-muted-foreground">
                      {isCheckingUsername
                        ? "Checking availability..."
                        : "3-20 characters, lowercase, numbers, underscores, hyphens"}
                    </p>
                  )}
                  {usernameSuggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">Try these instead:</p>
                      <div className="flex flex-wrap gap-2">
                        {usernameSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleUsernameChange(suggestion)}
                            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                    aria-describedby={error ? "form-error" : undefined}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                    aria-describedby={error ? "form-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  id="form-error"
                  className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-sky-700 text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : isLogin ? (
                  "Login to DumpIt"
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-sm">or continue with</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full bg-background border border-input text-foreground py-3 px-4 rounded-lg font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="Continue with Google"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
