'use client'

import { Loader2, Plus, Globe, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';

interface AddResourceProps {
  onSuccess: () => void;
}

const TAGS = [
  'Tutorial',
  'Article',
  'Video',
  'Tool',
  'Documentation',
  'Course',
  'Book',
  'Podcast',
  'Newsletter',
  'Other',
];

export function AddResource({ onSuccess }: AddResourceProps) {
  const { user } = useAuth();
  const { collections, fetchCollections, refreshCollections } = useCollections();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('Article');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('none');
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    if (user) fetchCollections().catch(() => {});
  }, [user, fetchCollections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        user_id: user.uid,
        title,
        link,
        note,
        tag,
        is_public: isPublic,
      };

      // If user selected an existing collection, include it
      if (selectedCollectionId && selectedCollectionId !== 'none' && selectedCollectionId !== 'new') {
        payload.collection_ids = [selectedCollectionId];
      }

      // If user wants to create a new collection, include new_collection payload
      if (selectedCollectionId === 'new' && newCollectionName.trim().length > 0) {
        payload.new_collection = { name: newCollectionName.trim() };
      }

      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add resource');
      }
      const data = await response.json();

      // Reset form
      setTitle('');
      setLink('');
      setNote('');
      setTag('Article');
      setIsPublic(false);
      // If the backend created a collection for us, select it -- otherwise clear the selection
      if (data && data.createdCollectionId) {
        setSelectedCollectionId(data.createdCollectionId);
      } else {
        setSelectedCollectionId('none');
      }
      setNewCollectionName('');

      // Refresh local collections so newly created collection appears in the UI
      refreshCollections().catch(() => {});
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Add New Resource
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Resource title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link *
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Add a note about this resource..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tag
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection</label>
            <div className="flex gap-2 items-center">
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="none">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="new">Create new collection...</option>
              </select>

              {/* Quick create button to toggle to new-collection mode */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCollectionId('new');
                  setNewCollectionName('');
                  // Move focus to the new collection input after next paint
                  setTimeout(() => {
                    const el = document.getElementById('new-collection-name-input') as HTMLInputElement | null;
                    el?.focus();
                  }, 50);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                title="Create new collection"
              >
                <Plus className="w-4 h-4" /> New
              </button>
            </div>

            {selectedCollectionId === 'new' && (
              <div className="mt-2">
                <input
                  id="new-collection-name-input"
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="New collection name"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {isPublic ? (
                  <>
                    <Globe className="w-4 h-4 text-green-600" />
                    Public - visible to everyone
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-gray-400" />
                    Private - only you can see
                  </>
                )}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}
