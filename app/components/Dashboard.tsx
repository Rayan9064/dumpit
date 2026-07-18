'use client'

import { Edit, ExternalLink, FolderPlus, Globe, Loader2, Lock, MoreHorizontal, Search, Trash2, Sparkles } from 'lucide-react'
import { Tooltip } from 'react-tooltip'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections } from '../contexts/CollectionsContext'
import { authFetch } from '../lib/authFetch'
import { CollectionsSidebar } from './collections/CollectionsSidebar'
import { ResourceCollectionManager } from './collections/ResourceCollectionManager'
import { EditResource } from './EditResource'

function formatDate(dateValue: any): string {
  if (!dateValue) return ''
  try {
    if (dateValue && typeof dateValue.toDate === 'function') return dateValue.toDate().toLocaleDateString()
    const date = new Date(dateValue)
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString()
  } catch {
    return ''
  }
}

interface Resource {
  id: string
  user_id: string
  title: string
  link: string
  note?: string
  tag: string
  is_public: boolean
  index_status?: 'pending' | 'indexed' | 'failed' | 'skipped'
  created_at: Date | string | { toDate: () => Date }
  collection_ids?: string[]
}

const statusStyles: Record<string, string> = {
  indexed: 'app-chip-success',
  pending: 'app-chip-warning',
  failed: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
  skipped: '',
}

export function Dashboard({ onNavigate }: { onNavigate?: (page: 'dashboard' | 'add' | 'shared' | 'ai' | 'profile') => void }) {
  const { user } = useAuth()
  const { collections, addResourceToCollection, removeResourceFromCollection } = useCollections()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [managerResource, setManagerResource] = useState<Resource | null>(null)
  const [openMenuResourceId, setOpenMenuResourceId] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const hasInitialFetchRef = useRef(false)

  useEffect(() => {
    if (user && !hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true
      loadResources(null)
    }
  }, [user])

  useEffect(() => {
    if (hasInitialFetchRef.current && selectedCollectionId !== null) {
      loadResources(selectedCollectionId)
    }
  }, [selectedCollectionId])

  useEffect(() => {
    setSelectedTag('all')
  }, [selectedCollectionId])

  const loadResources = async (collectionId: string | null = selectedCollectionId) => {
    if (!user) return
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (collectionId) queryParams.set('collectionId', collectionId)
      queryParams.set('limit', '20')
      const response = await authFetch(user, `/api/resources?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to load resources')
      const data = await response.json()
      setResources(data.resources || [])
      setNextCursor(data.nextCursor || null)
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!user || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const queryParams = new URLSearchParams()
      if (selectedCollectionId) queryParams.set('collectionId', selectedCollectionId)
      queryParams.set('cursor', nextCursor)
      queryParams.set('limit', '20')
      const response = await authFetch(user, `/api/resources?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to load more resources')
      const data = await response.json()
      setResources((prev) => [...prev, ...(data.resources || [])])
      setNextCursor(data.nextCursor || null)
    } catch (error) {
      console.error('Error loading more resources:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const filteredResources = useMemo(() => {
    let filtered = [...resources]
    if (selectedCollectionId) {
      filtered = filtered.filter((resource) => (resource.collection_ids || []).includes(selectedCollectionId))
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((resource) =>
        resource.title.toLowerCase().includes(query) ||
        resource.note?.toLowerCase().includes(query) ||
        resource.link.toLowerCase().includes(query)
      )
    }
    if (selectedTag !== 'all') {
      filtered = filtered.filter((resource) => resource.tag === selectedTag)
    }
    return filtered
  }, [resources, selectedCollectionId, searchQuery, selectedTag])

  const tags = useMemo(() => [...new Set(resources.map((resource) => resource.tag).filter(Boolean))], [resources])
  const activeCollection = useMemo(() => selectedCollectionId ? collections.find((collection) => collection.id === selectedCollectionId) : null, [selectedCollectionId, collections])
  const indexedCount = resources.filter((resource) => resource.index_status === 'indexed').length
  const publicCount = resources.filter((resource) => resource.is_public).length

  const deleteResource = async (id: string) => {
    if (!user) return
    if (!confirm('Delete this resource? This also removes its indexed chunks.')) return

    try {
      const response = await authFetch(user, `/api/resources?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete resource')
      loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
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
    <>
      {editingResource && (
        <EditResource
          resource={editingResource}
          onSuccess={() => {
            setEditingResource(null)
            loadResources()
          }}
          onCancel={() => setEditingResource(null)}
        />
      )}

      {managerResource && (
        <ResourceCollectionManager
          open
          resourceTitle={managerResource.title}
          collectionIds={managerResource.collection_ids || []}
          collections={collections}
          onClose={() => setManagerResource(null)}
          onApply={async (added, removed) => {
            const resourceId = managerResource.id
            await Promise.all([
              ...added.map((id) => addResourceToCollection(id, resourceId)),
              ...removed.map((id) => removeResourceFromCollection(id, resourceId)),
            ])
            const nextCollectionIds = [
              ...(managerResource.collection_ids || []).filter((id) => !removed.includes(id)),
              ...added,
            ]
            setResources((prev) => prev.map((resource) => resource.id === resourceId ? { ...resource, collection_ids: nextCollectionIds } : resource))
            setManagerResource(null)
          }}
        />
      )}

      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="app-chip mb-3">Resource library</span>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white">
              {activeCollection ? activeCollection.name : 'Your vault'}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Search, organize, and inspect the resources that power Ask DumpIt.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="app-muted-panel p-3">
              <div className="text-xl font-bold text-slate-950 dark:text-white">{resources.length}</div>
              <div className="text-xs text-slate-500">Resources</div>
            </div>
            <div className="app-muted-panel p-3">
              <div className="text-xl font-bold text-slate-950 dark:text-white">{indexedCount}</div>
              <div className="text-xs text-slate-500">Indexed</div>
            </div>
            <div className="app-muted-panel p-3">
              <div className="text-xl font-bold text-slate-950 dark:text-white">{publicCount}</div>
              <div className="text-xs text-slate-500">Public</div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <CollectionsSidebar activeCollectionId={selectedCollectionId} onSelect={setSelectedCollectionId} />

          <main className="min-w-0 space-y-4">
            <div className="app-panel p-3">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search title, note, or URL..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="app-input pl-9"
                  />
                </div>
                <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)} className="app-input md:w-44">
                  <option value="all">All tags</option>
                  {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
            </div>

            {resources.length === 0 ? (
              <div className="app-panel p-8 md:p-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white">Welcome to your DumpIt vault! 🚀</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Let's set up your AI knowledge vault in 3 easy steps.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">1</div>
                      <h4 className="mt-3 font-semibold text-slate-900 dark:text-white">Capture a Source</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Save your first bookmark or write a text-only note in the dashboard.</p>
                    </div>
                    {onNavigate && (
                      <button onClick={() => onNavigate('add')} className="mt-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Go to Capture &rarr;
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">2</div>
                      <h4 className="mt-3 font-semibold text-slate-900 dark:text-white">Ask AI Search</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Query your sources semantic-style to get instant citations and answers.</p>
                    </div>
                    {onNavigate && (
                      <button onClick={() => onNavigate('ai')} className="mt-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Ask DumpIt &rarr;
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">3</div>
                      <h4 className="mt-3 font-semibold text-slate-900 dark:text-white">Configure Profile</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Make selected resources public and share your reading list with others.</p>
                    </div>
                    {onNavigate && (
                      <button onClick={() => onNavigate('profile')} className="mt-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        View Profile Settings &rarr;
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Want to see it in action first? Get started instantly with demo data.
                  </div>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const samples = [
                          {
                            title: 'Introducing AlphaFold 3',
                            link: 'https://www.deepmind.com/blog/introducing-alphafold-3',
                            note: 'Google DeepMind\'s biological structure prediction model that predicts molecular interactions.',
                            tag: 'Article',
                          },
                          {
                            title: 'Next.js App Router Documentation',
                            link: 'https://nextjs.org/docs',
                            note: 'Complete framework reference for built-in caching, React server components, and styling.',
                            tag: 'Documentation',
                          },
                          {
                            title: 'Welcome to my DumpIt Notes',
                            link: '',
                            note: 'This is a custom plain text note resource saved directly into my AI knowledge vault! I can save thoughts, book highlights, and code snippets here.',
                            tag: 'Note',
                          }
                        ];

                        for (const sample of samples) {
                          await fetch('/api/resources', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${await user?.getIdToken()}`,
                            },
                            body: JSON.stringify(sample),
                          });
                        }
                        await loadResources(null);
                      } catch (err) {
                        console.error('Failed to import samples:', err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    Import Demo Content
                  </button>
                </div>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="app-panel p-10 text-center">
                <Search className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">No resources found</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Try a different search or tag filter.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredResources.map((resource) => {
                  const assignedCollections = (resource.collection_ids || [])
                    .map((id) => collections.find((collection) => collection.id === id))
                    .filter((collection): collection is typeof collections[0] => Boolean(collection))
                    .slice(0, 2)
                  const remainingCount = (resource.collection_ids?.length ?? 0) - assignedCollections.length
                  const status = resource.index_status || 'pending'

                  return (
                    <article key={resource.id} className="app-panel p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="app-chip">{resource.tag}</span>
                          <span className={`app-chip ${statusStyles[status] || ''}`}>{status}</span>
                          <span className={`app-chip ${resource.is_public ? 'app-chip-success' : ''}`}>
                            {resource.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            {resource.is_public ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuResourceId(openMenuResourceId === resource.id ? null : resource.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="More actions"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          {openMenuResourceId === resource.id && (
                            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                              <button onClick={() => { setEditingResource(resource); setOpenMenuResourceId(null) }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"><Edit className="h-4 w-4" /> Edit</button>
                              <button onClick={() => { setManagerResource(resource); setOpenMenuResourceId(null) }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"><FolderPlus className="h-4 w-4" /> Collections</button>
                              <button onClick={() => { deleteResource(resource.id); setOpenMenuResourceId(null) }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" /> Delete</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">{resource.title}</h3>
                      {resource.note && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{resource.note}</p>}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {assignedCollections.map((collection) => (
                          <span key={collection.id} className="app-chip" style={{ borderColor: collection.color || undefined }}>
                            {collection.icon || 'Folder'} {collection.name}
                          </span>
                        ))}
                        {remainingCount > 0 && <span className="text-xs text-slate-500">+{remainingCount} more</span>}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                        <span>{formatDate(resource.created_at)}</span>
                        <a href={resource.link} target="_blank" rel="noopener noreferrer" data-tooltip-id="dashboard-tooltip" data-tooltip-content={resource.link} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40">
                          Open <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </article>
                  )
                })}
              </div>
              {nextCursor && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        Loading more...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
          </main>
        </div>
      </div>

      <Tooltip id="dashboard-tooltip" />
    </>
  )
}
