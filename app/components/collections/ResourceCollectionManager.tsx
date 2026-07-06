'use client'

import { Check, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Collection } from '../../contexts/CollectionsContext'

interface ResourceCollectionManagerProps {
  open: boolean
  resourceTitle: string
  collectionIds: string[]
  collections: Collection[]
  onClose: () => void
  onApply: (added: string[], removed: string[]) => Promise<void>
}

export function ResourceCollectionManager({ open, resourceTitle, collectionIds, collections, onClose, onApply }: ResourceCollectionManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(collectionIds))
  const [pending, setPending] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelected(new Set(collectionIds))
  }, [collectionIds])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleApply = async () => {
    setPending(true)
    const original = new Set(collectionIds)
    const added = [...selected].filter((id) => !original.has(id))
    const removed = [...original].filter((id) => !selected.has(id))
    await onApply(added, removed)
    setPending(false)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div ref={dialogRef} className="app-panel w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Manage collections</h2>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{resourceTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[360px] space-y-2 overflow-y-auto px-5 py-4">
          {collections.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              Create a collection from the sidebar, then add this resource to it.
            </p>
          ) : (
            collections.map((collection) => {
              const isChecked = selected.has(collection.id)
              return (
                <button
                  key={collection.id}
                  onClick={() => handleToggle(collection.id)}
                  disabled={pending}
                  className={`flex min-h-14 w-full items-center justify-between rounded-lg border px-4 text-left transition-colors ${
                    isChecked
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-slate-950"
                      style={{ backgroundColor: collection.color || '#e2e8f0' }}
                    >
                      {collection.icon || collection.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate font-semibold text-slate-800 dark:text-white">{collection.name}</span>
                  </span>
                  {isChecked && <Check className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />}
                </button>
              )
            })
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending && <Loader2 className="h-5 w-5 animate-spin" />}
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
