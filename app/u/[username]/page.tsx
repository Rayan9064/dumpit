'use client'

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Search, RefreshCw, ExternalLink, Globe, Sparkles, BookOpen, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  link: string;
  note?: string;
  tag: string;
  created_at: string;
}

interface CacheData {
  timestamp: number;
  resources: Resource[];
}

const CACHE_TTL_MS = 5 * 60 * 1000;

const TAG_COLORS: Record<string, string> = {
  Tutorial: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
  Article: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
  Video: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
  Tool: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50',
  Documentation: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Course: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50',
  GitHub: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  Design: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50',
  Library: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50',
  Other: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || TAG_COLORS['Other'];
}

function getFavicon(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'link';
  }
}

function getInitials(name: string): string {
  return name.substring(0, 2).toUpperCase();
}

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
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            setResources(parsed.resources);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse cache:', e);
      }
    }

    try {
      const response = await fetch(`/api/resources?username=${encodeURIComponent(username)}&public=true`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('User not found');
        throw new Error('Failed to load shared resources');
      }
      const data = await response.json();
      const fetched: Resource[] = data.resources || [];
      setResources(fetched);
      sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), resources: fetched }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchResources(); }, [username]);

  useEffect(() => {
    if (username) document.title = `@${username}'s Library | DumpIt`;
  }, [username]);

  const handleManualRefresh = () => { setRefreshing(true); fetchResources(true); };

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    resources.forEach((r) => { if (r.tag) tags.add(r.tag); });
    return Array.from(tags);
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        resource.title?.toLowerCase().includes(q) ||
        resource.note?.toLowerCase().includes(q) ||
        resource.tag?.toLowerCase().includes(q) ||
        getDomain(resource.link).toLowerCase().includes(q);
      const matchesTag = !selectedTag || resource.tag === selectedTag;
      return matchesSearch && matchesTag;
    });
  }, [resources, searchQuery, selectedTag]);

  if (loading && !refreshing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-slate-950">
        <img src="/logo.png" alt="DumpIt" className="h-10 w-10 animate-pulse object-contain" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading library...</p>
      </div>
    );
  }

  if (error === 'User not found') {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-slate-950">
        <header className="border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center gap-3">
          <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">DumpIt</span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="max-w-sm w-full text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">User not found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              No public library found for{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">@{username}</span>.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex flex-col">

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="DumpIt logo" className="h-8 w-8 object-contain" />
            <span className="text-base font-bold text-slate-900 dark:text-white">DumpIt</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              Open app
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero / Profile banner */}
      <div className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-bold uppercase text-white shadow-lg shadow-blue-500/20 ring-4 ring-white dark:ring-slate-900">
                {getInitials(username)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">@{username}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Globe className="h-3 w-3" />
                    Public
                  </span>
                </div>
                <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  Publicly shared links and resources, powered by DumpIt AI knowledge vault.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 px-5 py-3 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resources.length}</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Public links</div>
              </div>
              {selectedTag && (
                <>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{filteredResources.length}</div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Filtered</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 space-y-5">

        {/* Search + filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, domain, tag, or notes..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            />
          </div>

          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                  selectedTag === null
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                All
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    tag === selectedTag
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resource cards */}
        {filteredResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <BookOpen className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No resources found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {resources.length === 0
                ? "This user hasn't shared any public resources yet."
                : 'Try adjusting your search or clearing the tag filter.'}
            </p>
            {(searchQuery || selectedTag) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={getFavicon(resource.link)}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded-sm object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {getDomain(resource.link)}
                    </span>
                  </div>
                  {resource.tag && (
                    <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getTagColor(resource.tag)}`}>
                      {resource.tag}
                    </span>
                  )}
                </div>

                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-2">
                  {resource.title || 'Untitled Resource'}
                </h3>

                {resource.note && (
                  <p className="line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 flex-1 mb-3">
                    {resource.note}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    <Sparkles className="h-3 w-3 text-blue-400" />
                    Shared via DumpIt
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 mt-auto">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <img src="/logo.png" alt="DumpIt" className="h-5 w-5 object-contain" />
            DumpIt
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} DumpIt &middot; AI-powered knowledge vault
          </p>
          <a
            href="/login"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Build your own library &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
