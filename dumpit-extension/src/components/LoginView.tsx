import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../lib/storage';
import { Loader2, LogIn, Lock, Mail, Eye, EyeOff, Sparkles, UserPlus, Globe } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

export default function LoginView({ onSuccess }: LoginViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3000');

  useEffect(() => {
    getApiBaseUrl().then(url => {
      setApiBaseUrl(url);
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let msg = 'Authentication failed.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email already in use. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleWebSignIn = () => {
    chrome.tabs.create({ url: `${apiBaseUrl}/login` });
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-2xl shadow-xl shadow-stone-200/40 dark:shadow-none transition-all duration-300">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-brand-800 dark:bg-stone-800 flex items-center justify-center text-white mb-3 shadow-md shadow-brand-500/20">
          <Sparkles className="h-6 w-6 text-stone-100" />
        </div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">DumpIt Vault</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">AI-powered knowledge extension</p>
      </div>

      {/* Recommended Web Login Method */}
      <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-stone-950 border border-brand-100/50 dark:border-stone-800/80 text-center space-y-3">
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-stone-500" />
          Recommended Authentication
        </h3>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal">
          Sign in via Google or email on the web dashboard to instantly connect this extension.
        </p>
        <button
          type="button"
          onClick={handleWebSignIn}
          className="btn-primary w-full text-xs font-semibold py-2 bg-brand-800 hover:bg-brand-900 text-white"
        >
          Sign In via Web App
        </button>
      </div>

      <div className="relative flex items-center mb-5">
        <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
        <span className="mx-3 text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">or local credentials</span>
        <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
      </div>

      <div className="flex rounded-lg bg-stone-100 dark:bg-stone-950 p-1 mb-5 border border-stone-200/50 dark:border-stone-800/50">
        <button
          type="button"
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${isLogin ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${!isLogin ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'}`}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 text-red-600 dark:text-red-300 rounded-lg animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="label-text">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="label-text">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLogin ? (
            <>
              <LogIn className="h-4 w-4" />
              <span>Log In to Vault</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
