'use client'

import { Globe, Loader2, Lock, Save, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { jsonAuthFetch } from '../lib/authFetch'

interface Resource {
  id: string
  title: string
  link: string
  tag: string
  note?: string
  is_public: boolean
}

interface EditResourceProps {
  resource: Resource
  onSuccess: () => void
  onCancel: () => void
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

export function EditResource({ resource, onSuccess, onCancel }: EditResourceProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState(resource.title)
  const [link, setLink] = useState(resource.link)
  const [note, setNote] = useState(resource.note || '')
  const [tag, setTag] = useState(resource.tag)
  const [isPublic, setIsPublic] = useState(resource.is_public)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user) return
      const response = await jsonAuthFetch(user, '/api/resources', {
        method: 'PUT',
        body: JSON.stringify({
          id: resource.id,
          title,
          link,
          note,
          tag,
          is_public: isPublic,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update resource')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
      <div className="app-panel w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Edit resource</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Changes can affect future AI indexing and citations.</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[78vh] space-y-4 overflow-y-auto p-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="edit-title" className="app-label">Title</label>
            <input id="edit-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} className="app-input mt-2" required />
          </div>

          <div>
            <label htmlFor="edit-link" className="app-label">Link</label>
            <input id="edit-link" type="url" value={link} onChange={(event) => setLink(event.target.value)} className="app-input mt-2" required />
          </div>

          <div>
            <label htmlFor="edit-note" className="app-label">Note</label>
            <textarea id="edit-note" value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="app-input mt-2 resize-y" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-tag" className="app-label">Tag</label>
              <select id="edit-tag" value={tag} onChange={(event) => setTag(event.target.value)} className="app-input mt-2">
                {TAGS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="app-label">Visibility</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                    !isPublic
                      ? 'border-zinc-400 bg-zinc-100 text-zinc-950 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                    isPublic
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Public
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
