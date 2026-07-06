'use client'

import { Loader2, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import type { Collection } from '../../contexts/CollectionsContext'

interface CollectionFormModalProps {
  collection?: Collection
  onClose: () => void
  onSubmit: (data: { name: string; description?: string; icon?: string; color?: string; is_shared?: boolean }) => Promise<void>
}

const COLORS = [
  '#2563EB',
  '#0F766E',
  '#16A34A',
  '#CA8A04',
  '#DC2626',
  '#7C3AED',
  '#DB2777',
  '#475569',
]

export function CollectionFormModal({ collection, onClose, onSubmit }: CollectionFormModalProps) {
  const [name, setName] = useState(collection?.name || '')
  const [description, setDescription] = useState(collection?.description || '')
  const [color, setColor] = useState(collection?.color || COLORS[0])
  const [isShared, setIsShared] = useState(collection?.is_shared || false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), color, is_shared: isShared })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="app-panel w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {collection ? 'Edit collection' : 'New collection'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Group related sources for faster review.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label htmlFor="collection-name" className="app-label">Name</label>
            <input
              id="collection-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="app-input mt-2"
              placeholder="Collection name"
              required
            />
          </div>

          <div>
            <label htmlFor="collection-description" className="app-label">Description</label>
            <textarea
              id="collection-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="app-input mt-2 resize-y"
              placeholder="Optional description"
            />
          </div>

          <div>
            <span className="app-label">Color</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setColor(item)}
                  className={`h-9 w-9 rounded-lg border-2 transition-transform ${
                    color === item ? 'border-slate-950 ring-2 ring-blue-200 dark:border-white dark:ring-blue-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: item }}
                  aria-label={`Use color ${item}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white">Share this collection</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Shared collections can help other users discover useful public sources.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShared((value) => !value)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  isShared ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-pressed={isShared}
                aria-label="Toggle collection sharing"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isShared ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {collection ? 'Save changes' : 'Create collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
