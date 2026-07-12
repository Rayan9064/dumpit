'use client'

import { Copy, Facebook, Linkedin, X } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  resourceNote?: string;
  resourceLink: string;
  username?: string;
}

export function ShareModal({ isOpen, onClose, resourceTitle, resourceNote, resourceLink, username }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Point to the user's public profile page if username is available, otherwise fallback to the resource's direct URL or the homepage
  const publicLink = username 
    ? `https://dumpit-three.vercel.app/u/${username.toLowerCase()}`
    : (resourceLink || `https://dumpit-three.vercel.app/`);
  const userHandle = '@DumpItApp';

  const handleTwitterShare = () => {
    const twitterText = `Just found this amazing resource: "${resourceTitle}" 🔥\n\n${resourceNote ? `${resourceNote.substring(0, 100)}...` : ''}\n\nCheck it out! ${publicLink}\n\n${userHandle} #DumpIt`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(url, '_blank');
  };

  const handleLinkedInShare = () => {
    // LinkedIn offsite share dialog: pre-filling text is deprecated by LinkedIn, but it will pull site preview
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicLink)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    // Facebook sharer: quote pre-filling is deprecated by Facebook, but it will pull site preview
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
            Resource Added!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Share this amazing resource with your network.
          </p>
        </div>

        <div className="space-y-2.5">
          {/* Twitter/X Button */}
          <button
            onClick={handleTwitterShare}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
          >
            {/* Custom Minimalist X Logo SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>

          {/* LinkedIn Button */}
          <button
            onClick={handleLinkedInShare}
            className="w-full flex items-center justify-center gap-3 bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
          >
            <Linkedin className="w-4.5 h-4.5" />
            Share on LinkedIn
          </button>

          {/* Facebook Button */}
          <button
            onClick={handleFacebookShare}
            className="w-full flex items-center justify-center gap-3 bg-[#1877f2] hover:bg-[#0f65d6] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
          >
            <Facebook className="w-4.5 h-4.5" />
            Share on Facebook
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Copy className="w-4.5 h-4.5" />
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-150 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-1 px-3 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
