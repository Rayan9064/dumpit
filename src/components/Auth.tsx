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

export function Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
<<<<<<< HEAD
  const [tab, setTab] = useState("login")
=======
  const [tab, setTab] = useState("login") // login or signup
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

<<<<<<< HEAD
  const emailValid = email.includes("@") && email.includes(".")
  const passwordValid = password.length >= 6

=======
  // Input validations
  const emailValid = email.includes("@") && email.includes(".")
  const passwordValid = password.length >= 6

  // Email/Password login or signup
>>>>>>> 103a9a3825538b99686d415d2314c828cd229ade
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
  }

  // UI
  return (
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
            >
              {item === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>
        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-600 font-semibold text-[0.99rem]">Email</label>
            <input
              type="email"
              id="email"
              value={email}
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
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
                  </svg>
                )}
              </button>
            </div>
            {passwordTouched && !passwordValid && (
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
          disabled={loading}
        >
          <Image
            src="/Google.png"
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
        </div>
      </div>
    </div>
  )
}
