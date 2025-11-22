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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <g>
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.6C34.6 34.6 29.6 38 24 38c-7.2 0-13-5.8-13-13s5.8-13 
      13-13c3.2 0 6.2 1.2 8.5 3.2l6.9-6.9C34.3 6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11.1 0 
      20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15.6 16.1 19.5 13 24 13c3.2 0 6.2 1.2 8.5 3.2l6.9-6.9C34.3 
      6 29.4 4 24 4c-7.1 0-13.2 3.9-16.7 10.7z"/>
      <path fill="#FBBC05" d="M24 44c5.2 0 10-1.8 13.7-5.1l-6.5-5.3C29.7 35 26.9 36 24 36c-5.5 0-10.3-
      3.4-12.4-8.2l-7 5.4C7.1 39.1 14.9 44 24 44z"/>
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.6c-1.4 4.3-5.3 7.5-11.6 7.5-5.5 0-10.2-3.2-12.1-7.8
      l-7-5.4C7.5 39.1 14.9 44 24 44c7.6 0 14-4.6 17.1-11.3z"/>
    </g>
  </svg>
)
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f

export function Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
<<<<<<< HEAD
  const [tab, setTab] = useState<"login" | "signup">("login")
=======
<<<<<<< HEAD
  const [tab, setTab] = useState("login")
=======
  const [tab, setTab] = useState("login") // login or signup
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

<<<<<<< HEAD
  const emailValid = email.includes("@") && email.includes(".")
  const passwordValid = password.length >= 6

=======
<<<<<<< HEAD
  const emailValid = email.includes("@") && email.includes(".")
  const passwordValid = password.length >= 6

=======
  // Input validations
  const emailValid = email.includes("@") && email.includes(".")
  const passwordValid = password.length >= 6

  // Email/Password login or signup
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailTouched(true)
    setPasswordTouched(true)
<<<<<<< HEAD
    
=======
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
    if (!emailValid || !passwordValid) {
      setError("Please fix the errors above")
      return
    }
<<<<<<< HEAD

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
=======
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
    }
    setLoading(false)
  }

<<<<<<< HEAD
=======
  // Google sign in
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (e: any) {
      setError("Google sign-in failed: " + (e.message || ""))
    }
    setLoading(false)
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
  }

  // UI
  return (
<<<<<<< HEAD
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
=======
<<<<<<< HEAD
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-violet-400 to-purple-300 px-2">
      <div
        className="relative w-full max-w-md flex flex-col items-center justify-center
        overflow-y-auto min-h-0 sm:min-h-[70vh] max-h-[98vh]
        rounded-2xl border border-[rgba(100,170,255,0.34)]
        bg-gradient-to-br from-white/80 via-white/70 to-blue-50/80
        shadow-xl p-4 sm:p-7 md:p-10"
        style={{
          boxShadow: '0 8px 48px -8px rgba(66,110,255,0.23)'
        }}
      >
        <span className="rounded-full bg-white shadow-md p-1 mb-2 -mt-4">
          <Image src="/logo.png" alt="DumpIt Logo" width={56} height={56} className="mx-auto" priority />
        </span>
        <h1 className="mb-1 text-3xl md:text-4xl font-bold text-[#2075f7] text-center"
          style={{
            textShadow: '0 1px 22px #79b5ff, 0 0 1px #2075f7'
          }}
        >DumpIt</h1>
        <div className="text-gray-700 text-base sm:text-lg mb-6 text-center font-medium">Your Personal Resource Vault</div>
        <div className="flex justify-center w-full mb-6 gap-2">
          {["login", "signup"].map(item => (
            <button
              key={item}
              className={`flex-1 py-2 rounded-xl text-base font-bold focus:outline-none transition-all
              ${tab === item
                ? "bg-[#2075f7] text-white shadow hover:bg-[#2075f7]/90"
                : "bg-white text-[#2075f7] border border-blue-200/50 hover:bg-blue-50"}`}
              onClick={() => { setTab(item); setError(""); }}
              aria-selected={tab === item}
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
            >
              {item === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>
<<<<<<< HEAD

        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="email" className="block mb-1.5 text-gray-700 font-semibold text-sm">
              Email
            </label>
=======
        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-600 font-semibold text-[0.99rem]">Email</label>
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
            <input
              type="email"
              id="email"
              value={email}
<<<<<<< HEAD
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
=======
              className={`w-full rounded-lg border border-gray-300 p-3 text-base bg-white focus:outline-none
                focus:ring-2 focus:ring-[#2075f7] transition-all
                ${emailTouched && !emailValid && "border-red-400 bg-red-50"}`}
              placeholder="you@example.com"
              required
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
            />
            {emailTouched && !emailValid && (
              <div className="text-red-500 text-xs mt-1 pl-1">Enter a valid email</div>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-gray-600 font-semibold text-[0.99rem]">Password</label>
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
<<<<<<< HEAD
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
=======
                className={`w-full rounded-lg border border-gray-300 p-3 pr-12 text-base bg-white
                  focus:outline-none focus:ring-2 focus:ring-[#2075f7] transition-all
                  ${passwordTouched && !passwordValid && "border-red-400 bg-red-50"}`}
                placeholder="Enter password"
                required
                minLength={6}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
              />
              <button
                type="button"
                className="absolute top-3 right-4 text-gray-400 focus:outline-none hover:text-[#2075f7]"
                onClick={() => setShowPassword(val => !val)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.02 10.02 0 0112 20a10.02 10.02 0 01-7.94-2.06M3 3l18 18"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.7 6.3a10 10 0 01-7.4 2.7 10 10 0 01-7.4-2.7"></path>
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
                  </svg>
                )}
              </button>
            </div>
            {passwordTouched && !passwordValid && (
<<<<<<< HEAD
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
=======
              <div className="text-red-500 text-xs mt-1 pl-1">Password must be at least 6 characters</div>
            )}
=======
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-[0_12px_60px_-12px_rgba(30,64,175,0.32)] p-6 md:p-10 transition-all">
        {/* Logo & Header */}
        <div className="flex flex-col items-center space-y-2 pb-7 animate-fade-in">
          <span className="block rounded-full bg-white shadow-lg p-2">
            <Image
              src="/logo.png"
              alt="DumpIt Logo"
              width={64}
              height={64}
              className="mx-auto"
              priority
            />
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">DumpIt</h1>
          <div className="text-gray-500 text-base md:text-lg font-medium text-center">Your Personal Resource Vault</div>
        </div>
        {/* Tab switch */}
        <div className="flex justify-between items-center mb-7 gap-2">
          {["login", "signup"].map(item => (
            <button
              key={item}
              className={`flex-1 px-4 py-2 rounded-xl font-semibold border transition-all focus:outline-none hover:scale-[1.04] ${
                tab === item
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => { setTab(item); setError(""); }}
              aria-selected={tab === item}
            >
              {item === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>
        {/* Form */}
        <form className="space-y-5" autoComplete="off" onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-700 font-semibold text-sm">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              className={`w-full rounded-xl border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${emailTouched && !emailValid && "border-red-400"}`}
              placeholder="you@example.com"
              required
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
            />
            {emailTouched && !emailValid && <div className="text-red-500 text-xs mt-1">Enter a valid email</div>}
          </div>
          <div className="relative">
            <label htmlFor="password" className="block mb-1 text-gray-700 font-semibold text-sm">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              className={`w-full rounded-xl border border-gray-300 p-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${passwordTouched && !passwordValid && "border-red-400"}`}
              placeholder="Enter password"
              required
              minLength={6}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-gray-500 focus:outline-none hover:text-blue-700"
              onClick={() => setShowPassword(val => !val)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.02 10.02 0 0112 20a10.02 10.02 0 01-7.94-2.06M3 3l18 18"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.7 6.3a10 10 0 01-7.4 2.7 10 10 0 01-7.4-2.7"></path>
                </svg>
              )}
            </button>
            {passwordTouched && !passwordValid && <div className="text-red-500 text-xs mt-1">Password must be at least 6 characters</div>}
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
          </div>
          {error && (
            <div className="text-red-600 text-sm mt-1 text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={!emailValid || !passwordValid || loading}
<<<<<<< HEAD
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg
              text-[1.07rem] transition-all
              ${emailValid && passwordValid && !loading
                ? "bg-gradient-to-r from-[#287ffd] via-[#0b4edf] to-[#2ac6fa] text-white hover:brightness-110"
                : "bg-gradient-to-r from-gray-300 to-gray-200 text-white"
              }`}
=======
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all text-lg
              ${emailValid && passwordValid && !loading ? "bg-blue-700 cursor-pointer hover:bg-blue-800" : "bg-gray-300 cursor-not-allowed"}
            `}
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
          >
            <span>{tab === "login" ? "Login" : "Sign Up"}</span>
            {!loading ? (
              <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4" fill="none"/><path d="M4 12a8 8 0 018-8v8z" fill="#fff"/></svg>
            )}
          </button>
        </form>
<<<<<<< HEAD
        <div className="flex items-center my-7 w-full">
=======
        {/* Social login separator and Google */}
        <div className="flex items-center my-7">
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
          <span className="border-t flex-1"></span>
          <span className="mx-3 text-gray-400 text-xs">OR</span>
          <span className="border-t flex-1"></span>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
<<<<<<< HEAD
          className="w-full py-3 flex items-center justify-center rounded-lg border border-gray-300
          bg-white shadow hover:bg-blue-50/50 transition font-semibold text-base text-gray-700"
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
          disabled={loading}
        >
          <Image
            src="/Google.png"
<<<<<<< HEAD
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
=======
            alt="Google logo"
            width={24}
            height={24}
            className="mr-2"
            style={{ objectFit: "cover" }}
          />
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>
        <div className="flex flex-col items-center mt-5 text-xs text-gray-500 gap-1">
          <span>By logging in, you accept our <a className="underline hover:text-[#2075f7]" href="/privacy" tabIndex={0}>Privacy Policy</a>.</span>
          <span>Need help? <a className="underline hover:text-[#2075f7]" href="/support" tabIndex={0}>Contact Support</a></span>
=======
          className="w-full py-3 flex items-center justify-center rounded-xl border border-gray-300 bg-white shadow-md hover:bg-gray-50 transition font-semibold text-base text-gray-600"
          disabled={loading}
        >
          <GoogleLogo />
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>
        {/* Legal/support links */}
        <div className="flex flex-col items-center mt-5 text-xs text-gray-500 gap-1">
          <span>By logging in, you accept our <a className="underline hover:text-blue-600" href="/privacy" tabIndex={0}>Privacy Policy</a>.</span>
          <span>Need help? <a className="underline hover:text-blue-600" href="/support" tabIndex={0}>Contact Support</a></span>
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
>>>>>>> 8c5d71f2bcb92fa8a2790cab3afe90a1c657bd0f
        </div>
      </div>
    </div>
  )
}
