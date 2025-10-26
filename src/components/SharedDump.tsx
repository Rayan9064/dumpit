'use client'

import { CheckCircle, ExternalLink, Filter, Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Helper function to safely format dates
function formatDate(dateValue: any): string {
  if (!dateValue) return '';
  
  try {
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle string dates or timestamps
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}

interface Resource {
  id: string;
  user_id: string;
  title: string;
  link: string;
  note?: string;
  tag: string;
  is_public: boolean;
  created_at: Date;
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
      const response = await fetch(`/api/public-resources?userId=${user!.uid}`);

      if (!response.ok) {
        throw new Error('Failed to load public resources');
      }

      const data = await response.json();
      const resourcesData = data.resources as Resource[];
      setResources(resourcesData);
      const uniqueTags = Array.from(new Set(resourcesData.map(r => r.tag)));
      setTags(uniqueTags);
    } catch (error) {
      console.error('Error loading public resources:', error);
    }
    setLoading(false);
  };

  const loadUserResources = async () => {
    try {
      const response = await fetch(`/api/resources?uid=${user!.uid}`);

      if (!response.ok) {
        throw new Error('Failed to load user resources');
      }

      const data = await response.json();
      const userResources = data.resources as Resource[];
      const links = new Set(userResources.map(r => r.link));
      setSavedResources(links);
    } catch (error) {
      console.error('Error loading user resources:', error);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.title.toLowerCase().includes(query) ||
          r.note?.toLowerCase().includes(query) ||
          r.link.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(r => r.tag === selectedTag);
    }

    setFilteredResources(filtered);
  };

  const saveToMyDump = async (resource: Resource) => {
    setSavingId(resource.id);

    try {
      const response = await fetch('/api/public-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.uid,
          resourceId: resource.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save resource');
      }

      setSavedResources(new Set([...savedResources, resource.link]));
    } catch (error) {
      console.error('Error saving resource:', error);
    }

    setSavingId(null);
  };

  const isResourceSaved = (link: string) => savedResources.has(link);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Shared Dump</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover public resources from the community</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search public resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="all">All Tags</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No public resources found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {resources.length === 0
              ? "No one has shared resources yet. Be the first!"
              : "Try adjusting your search or filter"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => {
            const isSaved = isResourceSaved(resource.link);
            const isSaving = savingId === resource.id;

            return (
              <div
                key={resource.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    {resource.tag}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {resource.title}
                </h3>

                {resource.note && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{resource.note}</p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Link
                  </a>
                </div>

                <button
                  onClick={() => !isSaved && saveToMyDump(resource)}
                  disabled={isSaved || isSaving}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-default'
                      : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Save to My Dump
                    </>
                  )}
                </button>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(resource.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
