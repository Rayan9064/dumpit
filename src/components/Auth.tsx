'use client'

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

  // Username validation regex: 3-20 characters, lowercase, numbers, underscores, hyphens
  const usernameRegex = /^[a-z0-9_-]{3,20}$/;

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
      return false; // Assume taken on error
    }
  };

  const generateUsernameSuggestions = (baseUsername: string): string[] => {
    const suggestions: string[] = [];
    const cleanBase = baseUsername.replace(/[^a-z0-9_-]/g, '').toLowerCase();

    // Add numbers
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${cleanBase}${i}`);
    }

    // Add underscores with numbers
    for (let i = 1; i <= 3; i++) {
      suggestions.push(`${cleanBase}_${i}`);
    }

    return suggestions.slice(0, 5); // Return first 5 suggestions
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setUsernameError('');
    setUsernameSuggestions([]);

    if (value.trim() === '') return;

    // Check format
    if (!validateUsernameFormat(value)) {
      setUsernameError('Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.');
      return;
    }

    // Check uniqueness
    const isAvailable = await checkUsernameUniqueness(value);
    if (!isAvailable) {
      setUsernameError('This username is already taken.');
      const suggestions = generateUsernameSuggestions(value);
      setUsernameSuggestions(suggestions);
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
          setError(error.message);
          setLoading(false);
        }
        // Success - auth state change will trigger navigation
      } else {
        // Validate username for signup
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
          setError(error.message);
          setLoading(false);
        }
        // Success - auth state change will trigger navigation
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
        setError(error.message || 'Failed to sign in with Google');
      }
      // Success - auth state change will trigger navigation
    } catch (err) {
      console.error('Google auth error:', err);
      setError('An unexpected error occurred with Google sign-in. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-2xl font-bold text-white">D</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">DumpIt</h1>
            <p className="text-gray-600">Your Personal Resource Vault</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    usernameError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="johndoe"
                  required={!isLogin}
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                )}
                {usernameSuggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Try these instead:</p>
                    <div className="flex flex-wrap gap-1">
                      {usernameSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleUsernameChange(suggestion)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            
            <div className="mt-6 relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-600 text-sm">or continue with</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
