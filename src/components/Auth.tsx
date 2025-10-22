'use client';

import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const usernameRegex = /^[a-z0-9_-]{3,20}$/;

  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const validateUsernameFormat = (username: string): boolean => {
    return usernameRegex.test(username);
  };

  const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        console.error('API error:', response.status);
        return false; // Assume taken on error
      }

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      return false;
    }
  };

  const generateUsernameSuggestions = (baseUsername: string): string[] => {
    const suggestions: string[] = [];
    const cleanBase = baseUsername.replace(/[^a-z0-9_-]/g, '').toLowerCase();
    for (let i = 1; i <= 5; i++) { suggestions.push(`${cleanBase}${i}`); }
    for (let i = 1; i <= 3; i++) { suggestions.push(`${cleanBase}_${i}`); }
    return suggestions.slice(0, 5);
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setUsernameError('');
    setUsernameSuggestions([]);
    if (value.trim() === '') return;
    if (!validateUsernameFormat(value)) {
      setUsernameError('Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.');
      return;
    }
    const isAvailable = await checkUsernameUniqueness(value);
    if (!isAvailable) {
      setUsernameError('This username is already taken.');
      setUsernameSuggestions(generateUsernameSuggestions(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(getFriendlyErrorMessage(error.code || ''));
          setLoading(false);
        }
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        if (!validateUsernameFormat(username)) {
          setError('Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.');
          setLoading(false);
          return;
        }
        const isAvailable = await checkUsernameUniqueness(username);
        if (!isAvailable) {
          setError('This username is already taken. Please choose a different one.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(getFriendlyErrorMessage(error.code || ''));
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(getFriendlyErrorMessage(error.code || '') || 'Failed to sign in with Google');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('An unexpected error occurred with Google sign-in. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-950 to-indigo-800 flex items-center justify-center px-3 sm:px-6 py-6">
      {/* Decorative Background Blobs for visual depth */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/4 top-0 w-96 h-96 bg-indigo-600 opacity-20 rounded-full filter blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-700 opacity-25 rounded-full filter blur-2xl"></div>
      </div>
      <div className="max-w-[95vw] xs:max-w-md sm:max-w-lg md:max-w-xl w-full">
        <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 xs:p-8 sm:p-12 border border-white/80 dark:border-slate-900">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-3 shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-900">
              <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">D</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-1">DumpIt</h1>
            <p className="text-center text-indigo-500 dark:text-indigo-300 text-xs sm:text-sm mb-1 font-medium">Your Personal Resource Vault</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 sm:mb-8 bg-indigo-100/50 dark:bg-indigo-900/30 p-1 rounded-xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'text-indigo-700 dark:text-indigo-200 hover:bg-white/15'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'text-indigo-700 dark:text-indigo-200 hover:bg-white/15'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    usernameError ? 'border-red-500' : 'border-indigo-200 dark:border-indigo-700'
                  } bg-slate-50 dark:bg-slate-900 text-indigo-900 dark:text-indigo-200`}
                  placeholder="johndoe"
                  required={!isLogin}
                />
                {usernameError && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{usernameError}</p>
                )}
                {usernameSuggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-indigo-500 mb-1">Try these instead:</p>
                    <div className="flex flex-wrap gap-1">
                      {usernameSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleUsernameChange(suggestion)}
                          className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
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
              <label htmlFor="email" className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-slate-50 dark:bg-slate-900 text-indigo-900 dark:text-indigo-200"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-slate-50 dark:bg-slate-900 text-indigo-900 dark:text-indigo-200"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-400 text-red-700 dark:text-red-200 px-4 py-2 rounded-xl text-xs sm:text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
            
            <div className="my-2 sm:my-4 flex items-center gap-2">
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
              <span className="text-xs sm:text-sm text-indigo-500 font-medium">or continue with</span>
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
            </div>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-slate-100 to-indigo-100 dark:from-slate-900 dark:to-indigo-900 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-200 py-3 px-4 rounded-xl font-semibold hover:bg-indigo-50 hover:dark:bg-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
    </div>
  );
}
