'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Collection } from '@/contexts/CollectionsContext'

interface CollectionFormValues {
  name: string
  description?: string
  icon?: string | null
  color?: string | null
  is_shared: boolean
}

interface CollectionFormModalProps {
  open: boolean
  title: string
  initialData?: Partial<Collection>
  onClose: () => void
  onSubmit: (values: CollectionFormValues) => Promise<void>
}

const COLOR_OPTIONS = ['#2563eb', '#22c55e', '#f97316', '#ec4899', '#0ea5e9', '#a855f7', '#64748b']

const DEFAULT_ICON = '🗂️'

export function CollectionFormModal({ open, title, initialData, onClose, onSubmit }: CollectionFormModalProps) {
  const [formState, setFormState] = useState<CollectionFormValues>({
    name: '',
    description: '',
    icon: DEFAULT_ICON,
    color: COLOR_OPTIONS[0],
    is_shared: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormState({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        icon: initialData.icon ?? DEFAULT_ICON,
        color: initialData.color ?? COLOR_OPTIONS[0],
        is_shared: Boolean(initialData.is_shared),
      })
    } else {
      setFormState({
        name: '',
        description: '',
        icon: DEFAULT_ICON,
        color: COLOR_OPTIONS[0],
        is_shared: false,
      })
    }
    setError(null)
  }, [initialData, open])

  useEffect(() => {
    setMounted(true)
  }, [])

  const disabled = useMemo(() => submitting || !formState.name.trim(), [submitting, formState.name])

  if (!open || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: formState.name.trim(),
        description: formState.description?.trim() || '',
        icon: formState.icon || DEFAULT_ICON,
        color: formState.color || COLOR_OPTIONS[0],
        is_shared: formState.is_shared,
      })
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to save collection. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(30,41,59,0.50)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl mx-2 relative" style={{ minWidth: 0 }}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Frontend Favorites"
              className="mt-2 w-full rounded-lg border border-slate-200 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Description</label>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="A curated list of my go-to frontend tools."
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Icon</label>
              <input
                type="text"
                maxLength={2}
                value={formState.icon ?? ''}
                onChange={(e) => setFormState((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="🗂️"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Color</label>
              <div className="mt-3 flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setFormState((prev) => ({ ...prev, color }))}
                    className={`h-8 w-8 rounded-full border-2 ${
                      formState.color === color ? 'border-slate-900 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-slate-400 dark:ring-slate-600' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-gray-700 px-4 py-3 text-sm bg-white dark:bg-gray-700">
            <input
              type="checkbox"
              checked={formState.is_shared}
              onChange={(e) => setFormState((prev) => ({ ...prev, is_shared: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-slate-800 dark:text-white">Share this collection</span>
              <p className="text-xs text-slate-500 dark:text-gray-400">Shared collections can be discovered by other users.</p>
            </div>
          </label>

          {error && <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-gray-700 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting ? 'Saving…' : 'Save collection'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
