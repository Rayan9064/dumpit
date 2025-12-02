'use client'

import { CheckCircle, ExternalLink, Filter, Loader2, Plus, Search } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Helper function to safely format dates
function formatDate(dateValue: any): string {
  if (!dateValue) return 'Unknown date';
  
  try {
    if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString();
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    return 'Unknown date';
  } catch (error) {
    return 'Unknown date';
  }
}

interface Resource {
  id: string;
  title: string;
  link: string;
  tag: string;
  note?: string;
  is_public: boolean;
  created_at: string;
  uid: string;
  username?: string;
}

export function SharedDump() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [tags, setTags] = useState<string[]>([]);
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadPublicResources();
    loadUserResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedTag, resources]);

  const loadPublicResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/public-resources?userId=${user?.uid || ''}`);

      if (!response.ok) {
        throw new Error('Failed to load public resources');
      }

      const data = await response.json();
      setResources(data.resources || []);

      const uniqueTags = [...new Set((data.resources || []).map((r: Resource) => r.tag))] as string[];
      setTags(uniqueTags);
    } catch (error) {
      console.error('Error loading public resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserResources = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/resources?uid=${user.uid}`);
      if (!response.ok) return;
      const data = await response.json();
      const userResourceLinks = new Set<string>((data.resources || []).map((r: Resource) => r.link));
      setSavedResources(userResourceLinks);
    } catch (error) {
      console.error('Error loading user resources:', error);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.link.toLowerCase().includes(query) ||
          r.note?.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter((r) => r.tag === selectedTag);
    }

    setFilteredResources(filtered);
  };

  const handleSaveToMyDump = async (resource: Resource) => {
    if (!user) return;
    setSavingId(resource.id);

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          title: resource.title,
          link: resource.link,
          note: resource.note || '',
          tag: resource.tag,
          is_public: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resource');
      }

      setSavedResources((prev) => new Set([...prev, resource.link]));
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search public resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No public resources found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedTag !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Be the first to share a resource!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => {
            const isSaved = savedResources.has(resource.link);
            const isSaving = savingId === resource.id;

            return (
              <article
                key={resource.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    {resource.tag}
                  </span>
                  {user && resource.uid !== user.uid && (
                    <button
                      onClick={() => handleSaveToMyDump(resource)}
                      disabled={isSaved || isSaving}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSaved
                          ? 'bg-green-50 text-green-600 cursor-default'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isSaved ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          Save
                        </>
                      )}
                    </button>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {resource.title}
                </h3>

                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-2 truncate"
                  data-tooltip-id={`shared-link-tooltip-${resource.id}`}
                  data-tooltip-content={resource.link}
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{resource.link}</span>
                </a>
                <Tooltip id={`shared-link-tooltip-${resource.id}`} place="top" />

                {resource.note && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {resource.note}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>by {resource.username || 'Anonymous'}</span>
                  <span>{formatDate(resource.created_at)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
