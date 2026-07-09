import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../lib/storage';
import { Sparkles, Globe } from 'lucide-react';

export default function LoginView() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3000');

  useEffect(() => {
    getApiBaseUrl().then(url => {
      setApiBaseUrl(url);
    });
  }, []);

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
      <div className="p-5 rounded-2xl bg-brand-50 dark:bg-stone-950 border border-brand-100/50 dark:border-stone-800/80 text-center space-y-4 shadow-inner">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1.5">
          <Globe className="h-4 w-4 text-brand-700 dark:text-stone-400" />
          Web Authentication
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Authenticate securely using your Google or standard credentials on the DumpIt web dashboard. Your session will automatically synchronize back to the extension.
        </p>
        <button
          type="button"
          onClick={handleWebSignIn}
          className="btn-primary w-full text-xs font-semibold py-2.5 bg-brand-800 hover:bg-brand-900 text-white"
        >
          Sign In via Web App
        </button>
      </div>
    </div>
  );
}
