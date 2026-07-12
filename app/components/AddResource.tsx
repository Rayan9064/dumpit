'use client'

import { CheckCircle2, FolderPlus, Globe, Link2, Loader2, Lock, Plus, Sparkles } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections } from '../contexts/CollectionsContext'
import { jsonAuthFetch } from '../lib/authFetch'
import { ShareModal } from './ui/ShareModal'

interface AddResourceProps {
  onSuccess: () => void
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
]

export function AddResource({ onSuccess }: AddResourceProps) {
  const { user } = useAuth()
  const { collections, fetchCollections, refreshCollections } = useCollections()
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [note, setNote] = useState('')
  const [tag, setTag] = useState('Article')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enriching, setEnriching] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState('none')
  const [newCollectionName, setNewCollectionName] = useState('')
  const lastEnrichedLinkRef = useRef<string>('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharedResourceData, setSharedResourceData] = useState<{ title: string; note?: string; link: string }>({ title: '', note: '', link: '' })

  useEffect(() => {
    if (user) fetchCollections().catch(() => {})
  }, [user, fetchCollections])

  const enrichResource = async () => {
    if (!link) return
    setEnriching(true)
    setError('')

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: link }),
      })

      if (!response.ok) {
        throw new Error('Could not enrich this link')
      }

      const data = await response.json()
      if (!title && data.title) setTitle(data.title)
      if (!note && data.description) setNote(data.description)
      if (data.suggestedTag && TAGS.includes(data.suggestedTag)) setTag(data.suggestedTag)
      lastEnrichedLinkRef.current = link
    } catch (err) {
      console.error('Enrichment error:', err)
      setError(err instanceof Error ? err.message : 'Could not enrich this link')
    } finally {
      setEnriching(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const payload: any = {
        title,
        link,
        note,
        tag,
        is_public: isPublic,
      }

      if (selectedCollectionId && selectedCollectionId !== 'none' && selectedCollectionId !== 'new') {
        payload.collection_ids = [selectedCollectionId]
      }

      if (selectedCollectionId === 'new' && newCollectionName.trim().length > 0) {
        payload.new_collection = { name: newCollectionName.trim() }
      }

      const response = await jsonAuthFetch(user, '/api/resources', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add resource')
      }

      const data = await response.json()
      setSharedResourceData({ title, note, link })

      setTitle('')
      setLink('')
      setNote('')
      setTag('Article')
      setIsPublic(false)
      setSelectedCollectionId(data?.createdCollectionId || 'none')
      setNewCollectionName('')
      lastEnrichedLinkRef.current = ''

      refreshCollections().catch(() => {})
      setShowShareModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource')
    } finally {
      setLoading(false)
    }
  }

  const handleShareModalClose = () => {
    setShowShareModal(false)
    onSuccess()
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="app-chip app-chip-ai mb-3">Capture</span>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white">Save a source for AI search</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Add a link once. DumpIt stores the resource, queues indexing, and makes the source available to Ask DumpIt according to its visibility.
          </p>
        </div>
        <div className="app-muted-panel flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Indexed resources can be cited in answers.
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="app-panel p-5">
          <div className="space-y-5">
            <div>
              <label htmlFor="resource-link" className="app-label">Link</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="resource-link"
                    type="url"
                    value={link}
                    onChange={(event) => {
                      const nextLink = event.target.value
                      setLink(nextLink)
                      if (nextLink !== lastEnrichedLinkRef.current && lastEnrichedLinkRef.current !== '') {
                        setTitle('')
                        setNote('')
                        setTag('Article')
                      }
                    }}
                    className="app-input pl-10"
                    placeholder="https://example.com/useful-resource"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={enrichResource}
                  disabled={!link || enriching}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-950"
                >
                  {enriching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  AI enrich
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="resource-title" className="app-label">Title</label>
              <input
                id="resource-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="app-input mt-2"
                placeholder="Name this source"
                required
              />
            </div>

            <div>
              <label htmlFor="resource-note" className="app-label">Note</label>
              <textarea
                id="resource-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={5}
                className="app-input mt-2 min-h-32 resize-y"
                placeholder="What should future-you remember about this source?"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="app-panel p-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">Metadata</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="resource-tag" className="app-label">Tag</label>
                <select id="resource-tag" value={tag} onChange={(event) => setTag(event.target.value)} className="app-input mt-2">
                  {TAGS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="resource-collection" className="app-label">Collection</label>
                <div className="mt-2 flex gap-2">
                  <select
                    id="resource-collection"
                    value={selectedCollectionId}
                    onChange={(event) => setSelectedCollectionId(event.target.value)}
                    className="app-input"
                  >
                    <option value="none">No collection</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>{collection.name}</option>
                    ))}
                    <option value="new">Create new collection</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCollectionId('new')
                      setNewCollectionName('')
                      setTimeout(() => document.getElementById('new-collection-name-input')?.focus(), 50)
                    }}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Create new collection"
                  >
                    <FolderPlus className="h-5 w-5" />
                  </button>
                </div>
                {selectedCollectionId === 'new' && (
                  <input
                    id="new-collection-name-input"
                    type="text"
                    value={newCollectionName}
                    onChange={(event) => setNewCollectionName(event.target.value)}
                    className="app-input mt-2"
                    placeholder="New collection name"
                    required
                  />
                )}
              </div>
            </div>
          </section>

          <section className="app-panel p-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">Visibility</h2>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 text-left transition-colors ${
                  !isPublic
                    ? 'border-slate-400 bg-slate-100 text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Lock className="h-5 w-5" />
                <span>
                  <span className="block text-sm font-bold">Private</span>
                  <span className="block text-xs opacity-75">Only your AI workspace can retrieve it.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 text-left transition-colors ${
                  isPublic
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Globe className="h-5 w-5" />
                <span>
                  <span className="block text-sm font-bold">Public</span>
                  <span className="block text-xs opacity-75">Available to shared discovery and shared AI search.</span>
                </span>
              </button>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Save resource
          </button>
        </aside>
      </form>

      <ShareModal
        isOpen={showShareModal}
        onClose={handleShareModalClose}
        resourceTitle={sharedResourceData.title}
        resourceNote={sharedResourceData.note}
        resourceLink={sharedResourceData.link}
      />
    </div>
  )
}
