'use client'

import { Copy, Facebook, Linkedin, X } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  resourceNote?: string;
}

export function ShareModal({ isOpen, onClose, resourceTitle, resourceNote }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Create a mock public link for the resource
  const publicLink = `https://dumpit.app/shared/${Date.now()}`;
  const userHandle = '@DumpItApp';

  const handleTwitterShare = () => {
    const twitterText = `Just found this amazing resource: "${resourceTitle}" 🔥\n\n${resourceNote ? `${resourceNote.substring(0, 100)}...` : ''}\n\nCheck it out! ${publicLink}\n\n${userHandle} #DumpIt`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(url, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedInText = `Just discovered: "${resourceTitle}"\n\n${resourceNote ? `${resourceNote.substring(0, 150)}...` : ''}\n\nWorth checking out: ${publicLink}\n\nShared via DumpIt ${userHandle}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicLink)}&summary=${encodeURIComponent(linkedInText)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookText = `Check out this resource I found: "${resourceTitle}"\n\n${resourceNote ? `${resourceNote.substring(0, 100)}...` : ''}\n\n${publicLink}\n\nShared via DumpIt ${userHandle}`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}&quote=${encodeURIComponent(facebookText)}`;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🎉 Resource Added Successfully!
          </h3>
          <p className="text-gray-600">
            Share this amazing resource with your network
          </p>
        </div>

        <div className="space-y-3">
          {/* Twitter/X Button */}
          <button
            onClick={handleTwitterShare}
            className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
            Share on X (Twitter)
          </button>

          {/* LinkedIn Button */}
          <button
            onClick={handleLinkedInShare}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            Share on LinkedIn
          </button>

          {/* Facebook Button */}
          <button
            onClick={handleFacebookShare}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Facebook className="w-5 h-5" />
            Share on Facebook
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <Copy className="w-5 h-5" />
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}