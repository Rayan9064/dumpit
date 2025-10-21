'use client';

import { Loader2, LogIn, UserPlus, Eye, EyeOff, Mail, Lock, Google } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Your usernameRegex, error handling and validation logic...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // your auth submission code...
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    // your google auth code...
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-700 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000" />
        
        {/* Logo */}
        <div className="flex justify-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg">
            <span className="text-4xl font-extrabold text-white">D</span>
          </div>
        </div>

        <h1 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-400 mb-1 select-none">
          DumpIt
        </h1>
        <p className="text-center text-gray-700 mb-8 select-none">Your Personal Resource Vault</p>

        {/* Toggle */}
        <div className="flex gap-4 mb-8 bg-gray-100 rounded-full p-2">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 text-sm font-semibold rounded-full py-2 transition ${isLogin ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:text-indigo-700'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 text-sm font-semibold rounded-full py-2 transition ${!isLogin ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:text-indigo-700'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${usernameError ? 'border-red-500' : 'border-gray-300'}`}
                required={!isLogin}
              />
              {usernameError && <p className="text-red-600 mt-1 text-sm">{usernameError}</p>}
              {usernameSuggestions.length > 0 && (
                <div className="mt-2 space-x-2">
                  {usernameSuggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUsername(s)}
                      className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-indigo-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-indigo-500" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-12"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3.5 text-indigo-500 hover:text-indigo-700 transition"
                aria-label={showPass ? 'Hide Password' : 'Show Password'}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : isLogin ? <LogIn /> : <UserPlus />}
            {isLogin ? 'Login' : 'Create Account'}
          </button>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-6 text-gray-500 font-semibold">or continue with</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-3 text-gray-700 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 hover:from-gray-400 hover:via-gray-200 hover:to-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <>
                <Google className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </button>
        </form>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
