'use client'

import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  defaultIsLogin?: boolean;
}

export function Auth({ defaultIsLogin = true }: AuthProps) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Username validation regex: 3-20 characters, lowercase, numbers, underscores, hyphens
  const usernameRegex = /^[a-z0-9_-]{3,20}$/;

  // Map Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email. Try signing up instead.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const validateUsernameFormat = (value: string): boolean => {
    return usernameRegex.test(value);
  };

  const checkUsernameUniqueness = async (value: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const generateUsernameSuggestions = (base: string): string[] => {
    const suggestions: string[] = [];
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000);
    
    suggestions.push(`${base}${timestamp}`);
    suggestions.push(`${base}_${random}`);
    suggestions.push(`${base}-${random}`);
    suggestions.push(`the_${base}`);
    suggestions.push(`${base}_official`);
    
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
          const errorCode = error.code || '';
          setError(getFriendlyErrorMessage(errorCode));
        }
      } else {
        if (!validateUsernameFormat(username)) {
          setError('Please enter a valid username.');
          setLoading(false);
          return;
        }

        const isAvailable = await checkUsernameUniqueness(username);
        if (!isAvailable) {
          setError('Username is already taken. Please choose another.');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, username);
        if (error) {
          const errorCode = error.code || '';
          setError(getFriendlyErrorMessage(errorCode));
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const errorCode = error.code || '';
        setError(getFriendlyErrorMessage(errorCode));
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    // If the `signup` param is present, use it to switch the default tab. Use the prop as override otherwise.
    if (searchParams) {
      const signupParam = searchParams.get('signup');
      if (signupParam === 'true') {
        setIsLogin(false);
      } else if (signupParam === 'false') {
        setIsLogin(true);
      }
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

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
                onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="Choose a username"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center">
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
        </div>
      </div>
    </div>
  );
}
