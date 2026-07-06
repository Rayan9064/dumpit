'use client'

import { CheckCircle2, ExternalLink, Filter, Globe2, Loader2, Plus, Search, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authFetch, jsonAuthFetch } from '../lib/authFetch'

function formatDate(dateValue: any): string {
  if (!dateValue) return 'Unknown date'

  try {
    if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString()
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString()
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString()
    }
    return 'Unknown date'
  } catch {
    return 'Unknown date'
  }
}

interface Resource {
  id: string
  title: string
  link: string
  tag: string
  note?: string
  is_public: boolean
  created_at: string
  user_id?: string
  username?: string
  index_status?: 'pending' | 'indexed' | 'failed' | 'skipped'
}

export function SharedDump() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    loadPublicResources()
    loadUserResources()
  }, [user])

  const loadPublicResources = async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const response = await authFetch(user, '/api/public-resources')
      if (!response.ok) throw new Error('Failed to load public resources')
      const data = await response.json()
      setResources(data.resources || [])
    } catch (err) {
      console.error('Error loading public resources:', err)
      setError(err instanceof Error ? err.message : 'Failed to load public resources')
    } finally {
      setLoading(false)
    }
  }

  const loadUserResources = async () => {
    if (!user) return

    try {
      const response = await authFetch(user, '/api/resources')
      if (!response.ok) return
      const data = await response.json()
      const userResourceLinks = new Set<string>((data.resources || []).map((resource: Resource) => resource.link))
      setSavedResources(userResourceLinks)
    } catch (err) {
      console.error('Error loading user resources:', err)
    }
  }

  const tags = useMemo(() => [...new Set(resources.map((resource) => resource.tag).filter(Boolean))], [resources])

  const filteredResources = useMemo(() => {
    let filtered = [...resources]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(query) ||
          resource.link.toLowerCase().includes(query) ||
          resource.note?.toLowerCase().includes(query) ||
          resource.username?.toLowerCase().includes(query)
      )
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter((resource) => resource.tag === selectedTag)
    }

    return filtered
  }, [resources, searchQuery, selectedTag])

  const handleSaveToMyDump = async (resource: Resource) => {
    if (!user) return
    setSavingId(resource.id)

    try {
      const response = await jsonAuthFetch(user, '/api/public-resources', {
        method: 'POST',
        body: JSON.stringify({ resourceId: resource.id }),
      })

      if (!response.ok) throw new Error('Failed to save resource')
      setSavedResources((prev) => new Set([...prev, resource.link]))
    } catch (err) {
      console.error('Error saving resource:', err)
      setError(err instanceof Error ? err.message : 'Failed to save resource')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="app-chip app-chip-success mb-3">Shared discovery</span>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white">Public knowledge feed</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Browse public resources from the community, save useful sources, and expand what shared AI search can cite.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
          <div className="app-muted-panel p-3">
            <div className="text-xl font-bold text-slate-950 dark:text-white">{resources.length}</div>
            <div className="text-xs text-slate-500">Public links</div>
          </div>
          <div className="app-muted-panel p-3">
            <div className="text-xl font-bold text-slate-950 dark:text-white">{savedResources.size}</div>
            <div className="text-xs text-slate-500">Already saved</div>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="app-panel p-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, URL, note, or contributor..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="app-input pl-10"
            />
          </div>
          <div className="relative md:w-56">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)} className="app-input pl-9">
              <option value="all">All tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {filteredResources.length === 0 ? (
        <div className="app-panel p-10 text-center">
          <Globe2 className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">No shared resources found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            {searchQuery || selectedTag !== 'all'
              ? 'Try a broader search or clear the tag filter.'
              : 'Public resources will appear here once people share useful links.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredResources.map((resource) => {
            const isSaved = savedResources.has(resource.link)
            const isSaving = savingId === resource.id

            return (
              <article key={resource.id} className="app-panel flex min-h-[250px] flex-col p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="app-chip">{resource.tag}</span>
                    <span className="app-chip app-chip-success">
                      <Globe2 className="h-3.5 w-3.5" />
                      Public
                    </span>
                    {resource.index_status && <span className="app-chip">{resource.index_status}</span>}
                  </div>
                  <button
                    onClick={() => handleSaveToMyDump(resource)}
                    disabled={isSaved || isSaving}
                    className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-lg px-3 text-xs font-bold transition-colors ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:cursor-not-allowed disabled:opacity-75`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSaved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>

                <h3 className="line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">{resource.title}</h3>
                {resource.note && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{resource.note}</p>}

                <div className="mt-auto pt-5">
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span className="truncate">{resource.link}</span>
                  </a>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{resource.username || 'Anonymous'}</span>
                    </span>
                    <span>{formatDate(resource.created_at)}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
