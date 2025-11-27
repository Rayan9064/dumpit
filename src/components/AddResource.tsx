'use client'

import { CheckCircle, Loader2, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { useUrlEnrichment } from '../hooks/useUrlEnrichment';
import { MetadataPreviewCard } from './ui/MetadataPreviewCard';
import { ShareModal } from './ui/ShareModal';

const PREDEFINED_TAGS = [
  'Tutorial',
  'Article',
  'Video',
  'Tool',
  'Documentation',
  'Course',
  'GitHub',
  'Design',
  'Library',
  'Other'
];

interface UserProfile {
  id: string;
  username: string;
  email: string;
  share_by_default: boolean;
}

interface AddResourceProps {
  onSuccess: () => void;
}

export function AddResource({ onSuccess }: AddResourceProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState(PREDEFINED_TAGS[0]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [metadata, _setMetadata] = useState<any>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedResourceData, setSharedResourceData] = useState<{title: string, note?: string}>({title: '', note: ''});
  const { loading: enriching, error: enrichError } = useUrlEnrichment();

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const { collections, loading: collectionsLoading } = useCollections();

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`/api/user-profile?uid=${user!.uid}`);

      if (!response.ok) {
        throw new Error('Failed to load user profile');
      }

      const data = await response.json();
      const profileData = data.profile;
      setUserProfile(profileData);
      setIsPublic(Boolean(profileData.share_by_default));
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      setError('Link must start with http:// or https://');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: user!.uid,
            title,
            link,
            note: note.trim() || null,
            tag,
            is_public: isPublic,
            collection_ids: selectedCollectionId ? [selectedCollectionId] : [],
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add resource');
      }

      setSuccess(true);
      
      // Store resource data for sharing
      setSharedResourceData({
        title: title,
        note: note.trim() || undefined
      });

      // Reset form
      setTitle('');
      setLink('');
      setNote('');
      setTag(PREDEFINED_TAGS[0]);
      setSelectedCollectionId('');
      setIsPublic(userProfile?.share_by_default || false);

      // Show share modal after a brief success message
      setTimeout(() => {
        setSuccess(false);
        setShowShareModal(true);
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to add resource. Please try again.');
    }

    setLoading(false);
  };

  const handleEnrichUrl = async (_urlValue: string) => {
    // AI enrichment is disabled on the client to avoid Gemini network calls.
    // Show a Coming Soon popup instead of making network requests.
    setShowComingSoon(true);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
    onSuccess();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Resource</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Save a link to your vault</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Resource"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Link
            </label>
            <div className="flex gap-2">
              <input
                id="link"
                type="url"
                value={link}
                onChange={(e) => {
                  const newLink = e.target.value;
                  setLink(newLink);
                }}
                onBlur={(e) => {
                  const newLink = e.target.value;
                  if (newLink && isValidUrl(newLink)) {
                    handleEnrichUrl(newLink);
                  }
                }}
                placeholder="https://example.com (paste to auto-fill)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowComingSoon(true)}
                className="inline-flex items-center gap-2 bg-gray-100 px-3 rounded-md border border-gray-200 text-sm hover:bg-gray-200 transition-colors"
                title="AI Auto-fill (Coming Soon)"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
            {enriching && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching page details and generating summary...
              </div>
            )}
            {enrichError && (
              <p className="text-sm text-red-600 mt-1">{enrichError}</p>
            )}
          </div>

          {/* Metadata Preview Card */}
          {metadata && (
            <MetadataPreviewCard metadata={metadata} url={link} />
          )}

          {showComingSoon && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-3 dark:text-white">AI Auto-Enrichment — Coming Soon</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">We'll automatically fetch page metadata and generate intelligent summaries and tags for you. This will:</p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
                  <li>Save time by auto-filling title & description.</li>
                  <li>Provide concise, consistent summaries for better discovery.</li>
                  <li>Suggest relevant tags to improve organization.</li>
                </ul>
                <div className="flex justify-end">
                  <button onClick={() => setShowComingSoon(false)} className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg">Got it</button>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="note" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Note (optional)
                {isAiGenerated && (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 ml-2 font-normal">
                    <Sparkles className="w-3 h-3" />
                    AI-generated
                  </span>
                )}
              </label>
              {isAiGenerated && link && (
                <button
                  type="button"
                  onClick={() => setShowComingSoon(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate (Coming Soon)
                </button>
              )}
            </div>
            <textarea
              id="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                // Mark as manually edited if user changes AI-generated content
                if (isAiGenerated) {
                  setIsAiGenerated(false);
                }
              }}
              placeholder="AI will generate a summary when you add a link, or write your own..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="collection" className="block text-sm font-semibold text-gray-700 mb-2">
              Add to collection (optional)
            </label>
            <select
              id="collection"
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer mb-3"
            >
              <option value="">No collection</option>
              {collectionsLoading && <option disabled>Loading...</option>}
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label htmlFor="tag" className="block text-sm font-semibold text-gray-700 mb-2">
              Tag
            </label>
            <select
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
            >
              {PREDEFINED_TAGS.map((tagOption) => (
                <option key={tagOption} value={tagOption}>
                  {tagOption}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="isPublic" className="font-semibold text-gray-700 dark:text-gray-300">
                  Make this resource public
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Public resources can be viewed by others in Shared Dump
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isPublic ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-100 shadow ring-0 transition duration-200 ease-in-out ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Resource added successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Resource
              </>
            )}
          </button>
        </form>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={handleShareModalClose}
        resourceTitle={sharedResourceData.title}
        resourceNote={sharedResourceData.note}
      />
    </div>
  );
}
