'use client'

import { ArrowDown, ArrowUp, Folder, Globe2, MoreHorizontal, Pencil, Plus, Share2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCollections, type Collection } from '../../contexts/CollectionsContext'
import { CollectionFormModal } from './CollectionFormModal'

interface CollectionsSidebarProps {
  activeCollectionId: string | null
  onSelect: (collectionId: string | null) => void
}

interface ActionMenuState {
  open: boolean
  collectionId: string | null
  anchorRect: DOMRect | null
}

export function CollectionsSidebar({ activeCollectionId, onSelect }: CollectionsSidebarProps) {
  const {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
  } = useCollections()

  const [showModal, setShowModal] = useState(false)
  const [editCollection, setEditCollection] = useState<Collection | null>(null)
  const [menuState, setMenuState] = useState<ActionMenuState>({ open: false, collectionId: null, anchorRect: null })

  const sortedCollections = useMemo(
    () => [...collections].sort((a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity)),
    [collections]
  )

  const handleCreate = () => {
    setEditCollection(null)
    setShowModal(true)
  }

  const handleEdit = (collection: Collection) => {
    setEditCollection(collection)
    setShowModal(true)
    setMenuState({ open: false, collectionId: null, anchorRect: null })
  }

  const handleDelete = async (collectionId: string) => {
    const confirmed = window.confirm('Delete this collection? Resources will remain, but they will no longer belong to this collection.')
    if (!confirmed) return
    await deleteCollection(collectionId)
    if (activeCollectionId === collectionId) {
      onSelect(null)
    }
    setMenuState({ open: false, collectionId: null, anchorRect: null })
  }

  const moveCollection = async (collectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sortedCollections.findIndex((collection) => collection.id === collectionId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sortedCollections.length) return

    const reordered = [...sortedCollections]
    const [moved] = reordered.splice(currentIndex, 1)
    reordered.splice(newIndex, 0, moved)

    await reorderCollections(reordered.map((collection) => collection.id))
  }

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, collectionId: string) => {
    setMenuState({ open: true, collectionId, anchorRect: event.currentTarget.getBoundingClientRect() })
  }

  const closeMenu = () => setMenuState({ open: false, collectionId: null, anchorRect: null })

  const handleModalSubmit = async (values: Parameters<typeof createCollection>[0]) => {
    if (editCollection) {
      await updateCollection(editCollection.id, values)
    } else {
      await createCollection(values)
    }
    setShowModal(false)
  }

  return (
    <aside className="app-panel w-full lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-950 dark:text-white">Collections</h3>
        <button
          onClick={handleCreate}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <nav className="space-y-1 px-2 py-3">
        <button
          onClick={() => onSelect(null)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium ${
            activeCollectionId === null
              ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <Folder className="h-4 w-4" /> All resources
          </span>
          <span className="text-xs uppercase tracking-wide">All</span>
        </button>

        {loading && <p className="px-3 py-2 text-xs text-slate-500">Loading collections...</p>}

        {sortedCollections.map((collection, index) => {
          const isActive = activeCollectionId === collection.id
          return (
            <div key={collection.id} className={`group flex items-center rounded-lg px-1 ${isActive ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
              <button
                onClick={() => onSelect(collection.id)}
                className={`flex min-w-0 flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                  isActive
                    ? 'font-semibold text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-slate-950"
                    style={{ backgroundColor: collection.color || '#e2e8f0' }}
                  >
                    {collection.icon || collection.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{collection.name}</span>
                    {collection.is_shared && (
                      <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <Share2 className="h-3 w-3" /> Shared
                      </span>
                    )}
                  </span>
                </span>
              </button>
              <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  onClick={() => moveCollection(collection.id, 'up')}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveCollection(collection.id, 'down')}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  disabled={index === sortedCollections.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={(event) => openMenu(event, collection.id)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  title="Collection actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <Globe2 className="h-4 w-4" /> Discover shared collections
          </div>
          <p>Browse public resources from the Shared Dump page and save useful sources into your vault.</p>
        </div>
      </nav>

      {menuState.open && menuState.collectionId && (
        <div className="fixed inset-0 z-40" onClick={closeMenu}>
          <div
            className="absolute z-50 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
            style={{
              top: (menuState.anchorRect?.bottom || 0) + 4,
              left: (menuState.anchorRect?.left || 0) - 96,
            }}
          >
            <button
              onClick={() => {
                const collection = collections.find((item) => item.id === menuState.collectionId)
                if (collection) handleEdit(collection)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Pencil className="h-4 w-4" /> Edit collection
            </button>
            <button
              onClick={() => handleDelete(menuState.collectionId!)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" /> Delete collection
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <CollectionFormModal
          collection={editCollection || undefined}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </aside>
  )
}
