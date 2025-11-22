'use client'

import Image from "next/image"
import { useState } from "react"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

export function Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const emailValid = email.includes("@") && email.includes(".")
  const passwordValid = password.length >= 6

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailTouched(true)
    setPasswordTouched(true)
    
    if (!emailValid || !passwordValid) {
      setError("Please fix the errors above")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      if (tab === "login") {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (e: any) {
      setError(e.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")
    
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (e: any) {
      setError("Google sign-in failed: " + (e.message || ""))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-400 to-purple-600 p-4 sm:p-6 overflow-y-auto">
      <div
        className="relative w-full max-w-md my-auto rounded-2xl border border-blue-200/40 bg-white/95 backdrop-blur-sm shadow-2xl p-6 sm:p-8 md:p-10"
        style={{
          boxShadow: '0 10px 60px -10px rgba(66, 110, 255, 0.4)'
        }}
      >
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-white shadow-lg p-2">
            <Image 
              src="/logo.png" 
              alt="DumpIt Logo" 
              width={64} 
              height={64} 
              className="w-14 h-14 sm:w-16 sm:h-16" 
              priority 
            />
          </div>
        </div>

        <h1 
          className="mb-2 text-3xl sm:text-4xl font-bold text-[#2075f7] text-center"
          style={{
            textShadow: '0 2px 24px rgba(32, 117, 247, 0.3)'
          }}
        >
          DumpIt
        </h1>
        
        <p className="text-gray-600 text-sm sm:text-base mb-6 text-center font-medium">
          Your Personal Resource Vault
        </p>

        <div className="flex justify-center w-full mb-6 gap-2">
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              className={`flex-1 py-2.5 rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all
              ${tab === item
                ? "bg-[#2075f7] text-white shadow-lg hover:bg-[#1a5fd6]"
                : "bg-white text-[#2075f7] border-2 border-blue-200 hover:bg-blue-50"}`}
              onClick={() => {
                setTab(item)
                setError("")
              }}
              aria-selected={tab === item}
              role="tab"
            >
              {item === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="email" className="block mb-1.5 text-gray-700 font-semibold text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              className={`w-full rounded-lg border-2 p-3 text-sm sm:text-base bg-white focus:outline-none transition-all
                ${emailTouched && !emailValid 
                  ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400" 
                  : "border-gray-300 focus:border-[#2075f7] focus:ring-2 focus:ring-blue-200"
                }`}
              placeholder="you@example.com"
              required
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              disabled={loading}
            />
            {emailTouched && !emailValid && (
              <p className="text-red-500 text-xs mt-1.5 pl-1">
                Please enter a valid email address
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block mb-1.5 text-gray-700 font-semibold text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                className={`w-full rounded-lg border-2 p-3 pr-12 text-sm sm:text-base bg-white focus:outline-none transition-all
                  ${passwordTouched && !passwordValid 
                    ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400" 
                    : "border-gray-300 focus:border-[#2075f7] focus:ring-2 focus:ring-blue-200"
                  }`}
                placeholder="Enter password"
                required
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-[#2075f7] focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordTouched && !passwordValid && (
              <p className="text-red-500 text-xs mt-1.5 pl-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!emailValid || !passwordValid || loading}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg text-base sm:text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2
              ${emailValid && passwordValid && !loading
                ? "bg-gradient-to-r from-[#2075f7] to-[#1a5fd6] text-white hover:from-[#1a5fd6] hover:to-[#154bb8] focus:ring-blue-500 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{tab === "login" ? "Logging in..." : "Signing up..."}</span>
              </>
            ) : (
              <>
                <span>{tab === "login" ? "Login" : "Sign Up"}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center my-6 w-full">
          <div className="border-t border-gray-300 flex-1"></div>
          <span className="mx-4 text-gray-400 text-xs font-medium">OR</span>
          <div className="border-t border-gray-300 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 flex items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white shadow-md hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all font-semibold text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <Image
            src="/Google.png"
            alt="Google"
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>

        <div className="flex flex-col items-center mt-6 text-xs text-gray-500 gap-1.5">
          <span>
            By logging in, you accept our{" "}
            <a className="underline hover:text-[#2075f7] transition-colors" href="/privacy">
              Privacy Policy
            </a>
            .
          </span>
          <span>
            Need help?{" "}
            <a className="underline hover:text-[#2075f7] transition-colors" href="/support">
              Contact Support
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}
