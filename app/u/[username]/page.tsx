'use client'

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Search, RefreshCw, ExternalLink, Globe, Sparkles, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  link: string;
  note?: string;
  tag: string;
  created_at: any;
}

interface CacheData {
  timestamp: number;
  resources: Resource[];
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params?.username === 'string' ? params.username : '';

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResources = async (forceRefetch = false) => {
    if (!username) return;
    setLoading(true);
    setError('');

    const cacheKey = `dumpit_shared_user_${username.toLowerCase()}`;

    if (!forceRefetch) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed: CacheData = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          if (age < CACHE_TTL_MS) {
            setResources(parsed.resources);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse cache from sessionStorage:', e);
      }
    }

    try {
      const response = await fetch(`/api/resources?username=${encodeURIComponent(username)}&public=true`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to load shared resources');
      }

      const data = await response.json();
      const fetchedResources: Resource[] = data.resources || [];
      
      setResources(fetchedResources);

      // Save to cache
      const cacheData: CacheData = {
        timestamp: Date.now(),
        resources: fetchedResources
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [username]);

  // Set page meta title dynamically
  useEffect(() => {
    if (username) {
      document.title = `@${username}'s Shared Library | DumpIt`;
    }
  }, [username]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchResources(true);
  };

  // Get unique tags from all resources
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    resources.forEach((r) => {
      if (r.tag) tags.add(r.tag);
    });
    return Array.from(tags);
  }, [resources]);

  // Filter resources by search query and tag selection
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tag?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = !selectedTag || resource.tag === selectedTag;

      return matchesSearch && matchesTag;
    });
  }, [resources, searchQuery, selectedTag]);

  // Helper to extract clean domain name
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'link';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading library...</p>
        </div>
      </div>
    );
  }

  if (error === 'User not found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 dark:bg-slate-950 px-4">
        <div className="max-w-md text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            The user profile <span className="font-semibold text-slate-800 dark:text-slate-200">@{username}</span> does not exist or has no shared resources.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Navbar header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-10 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            D
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">DumpIt</h1>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-semibold leading-none">Shared Library</span>
          </div>
        </div>
        
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh shared resources"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* Profile Card Header */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg shadow-blue-500/10">
              {username ? username.substring(0, 2) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">@{username}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100/50 dark:border-emerald-900/40">
                  <Globe className="w-3 h-3" /> Public
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore public links and resources saved in my AI-powered second brain.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 px-5 py-4 rounded-xl text-center md:text-right shrink-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resources.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Shared Resources</div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Search resources by title, tags, notes..."
              />
            </div>
          </div>

          {/* Tag Pills */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mr-1.5">Tags:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedTag === null
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                All
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    tag === selectedTag
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Resources Grid */}
        <section className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-350 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No resources found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {resources.length === 0
                  ? 'This user has not shared any public resources yet.'
                  : 'Try adjusting your search terms or filters.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1">
              {filteredResources.map((resource) => (
                <article
                  key={resource.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md hover:shadow-slate-100/50 dark:hover:shadow-none flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 group-hover:translate-x-0.5 transform duration-150 text-base"
                      >
                        {resource.title || 'Untitled Source'}
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      {resource.tag && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-150/40 dark:border-slate-700/60 shrink-0">
                          {resource.tag}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-tight">
                      {getDomain(resource.link)}
                    </span>
                    
                    {resource.note && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-stone-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 rounded-xl px-4 py-3 mt-2 font-normal">
                        {resource.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase pt-2 border-t border-slate-100 dark:border-slate-950">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Shared via DumpIt</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-450">
        <p>© {new Date().getFullYear()} DumpIt. All rights reserved.</p>
        <p className="mt-1 text-slate-400 dark:text-slate-500">
          AI-powered knowledge vault for your saved links.
        </p>
      </footer>
    </div>
  );
}
