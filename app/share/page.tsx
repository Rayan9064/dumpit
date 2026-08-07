'use client'

import { CheckCircle2, Loader2, Share2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { jsonAuthFetch } from '../lib/authFetch'
import { isUpgradeRequiredError, UpgradePrompt } from '../components/ui/UpgradePrompt'

const URL_PATTERN = /https?:\/\/[^\s]+/i

function extractLinkAndNote(title: string, text: string, url: string): { link: string; note: string } {
  if (url) return { link: url, note: text }

  const match = text.match(URL_PATTERN)
  if (match) {
    const link = match[0]
    const note = text.replace(link, '').trim()
    return { link, note }
  }

  return { link: '', note: text || title }
}

function SharePageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [upgradeError, setUpgradeError] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      const next = `/share?${searchParams.toString()}`
      router.push(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [user, loading, router, searchParams])

  useEffect(() => {
    const sharedTitle = searchParams.get('title') || ''
    const sharedText = searchParams.get('text') || ''
    const sharedUrl = searchParams.get('url') || ''
    const { link: derivedLink, note: derivedNote } = extractLinkAndNote(sharedTitle, sharedText, sharedUrl)

    setTitle(sharedTitle)
    setLink(derivedLink)
    setNote(derivedNote)
  }, [searchParams])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError('')
    setUpgradeError(false)

    try {
      const payload = {
        title: title || undefined,
        link: link || undefined,
        note: note || undefined,
        tag: link ? 'Article' : 'Note',
        is_public: false,
      }

      const response = await jsonAuthFetch(user, '/api/resources', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (isUpgradeRequiredError(response.status, errorData)) {
          setError(errorData.error || 'Upgrade required')
          setUpgradeError(true)
          return
        }
        throw new Error(errorData.error || 'Failed to save')
      }

      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-zinc-950">
        <div className="app-panel w-full max-w-md p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
          <h1 className="text-xl font-bold text-zinc-950 dark:text-white">Saved to your vault</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">It's queued for AI indexing and searchable shortly.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Open your vault
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-8 dark:bg-zinc-950">
      <div className="app-panel w-full max-w-md p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
          <Share2 className="h-4 w-4" />
          Shared to DumpIt
        </div>

        {error && (
          upgradeError ? (
            <div className="mb-4"><UpgradePrompt message={error} user={user} /></div>
          ) : (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="share-title" className="app-label">Title</label>
            <input
              id="share-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="app-input mt-2"
              placeholder="Name this source"
            />
          </div>

          {link && (
            <div>
              <label htmlFor="share-link" className="app-label">Link</label>
              <input
                id="share-link"
                type="url"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                className="app-input mt-2"
              />
            </div>
          )}

          <div>
            <label htmlFor="share-note" className="app-label">Note</label>
            <textarea
              id="share-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="app-input mt-2 min-h-24 resize-y"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || (!link && !note && !title)}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save to vault'}
        </button>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SharePageContent />
    </Suspense>
  )
}
