'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
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
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  const isSelected = (id: string) => selected.has(id)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
      >
        <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Manage Collections</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Choose collections to keep "{resourceTitle}" organized.</p>
        </div>
        <div className="max-h-[340px] space-y-2 overflow-y-auto px-6 py-4">
          {collections.length === 0 ? (
            <p className="rounded-lg bg-slate-50 dark:bg-gray-700 px-3 py-2 text-sm text-slate-500 dark:text-gray-300">
              You haven't created any collections yet. Create one from the sidebar first.
            </p>
          ) : (
            collections.map((collection) => {
              const isChecked = isSelected(collection.id)
              return (
                <button
                  key={collection.id}
                  onClick={() => handleToggle(collection.id)}
                  disabled={pending}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="font-medium text-slate-800 dark:text-white">{collection.name}</span>
                  {isChecked && <Check className="h-5 w-5 text-blue-600" />}
                </button>
              )
            })
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
