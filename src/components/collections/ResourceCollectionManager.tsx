'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import type { Collection } from '@/contexts/CollectionsContext'

interface ResourceCollectionManagerProps {
  open: boolean
  resourceTitle: string
  collectionIds: string[]
  collections: Collection[]
  onClose: () => void
  onApply: (newCollectionIds: string[]) => Promise<void>
}

export function ResourceCollectionManager({ open, resourceTitle, collectionIds, collections, onClose, onApply }: ResourceCollectionManagerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(collectionIds);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelectedIds(collectionIds);
  }, [collectionIds, open]);

  if (!open || !mounted) return null;

  const handleToggle = (collectionId: string) => {
    setSelectedIds((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleApply = async () => {
    setPending(true);
    await onApply(selectedIds);
    setPending(false);
    onClose();
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === e.currentTarget) {
      onClose();
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(30,41,59,0.50)', backdropFilter: 'blur(8px)' }}
      onClick={handleOutsideClick}
    >
      <div ref={modalRef} className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl relative">
        <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Assign collections</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Choose collections to keep “{resourceTitle}” organized.</p>
        </div>
        <div className="max-h-[340px] space-y-2 overflow-y-auto px-6 py-4">
          {collections.length === 0 ? (
            <p className="rounded-lg bg-slate-50 dark:bg-gray-700 px-3 py-2 text-sm text-slate-500 dark:text-gray-300">
              You haven’t created any collections yet. Create one from the sidebar first.
            </p>
          ) : (
            collections.map((collection) => {
              const selected = isSelected(collection.id);
              return (
                <button
                  key={collection.id}
                  onClick={() => handleToggle(collection.id)}
                  disabled={pending}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200'
                        : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: collection.color || '#e2e8f0' }}
                    >
                      {collection.icon || '🗂️'}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{collection.name}</span>
                      {collection.description && (
                        <span className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1">{collection.description}</span>
                      )}
                    </span>
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold transition ${
                      selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-400 dark:text-gray-300'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </button>
              );
            })
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={handleApply}
            disabled={pending}
            className="rounded-lg border border-slate-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
