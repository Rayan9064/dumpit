import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  is_shared: boolean;
  sort_order: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CollectionsContextValue {
  collections: Collection[];
  loading: boolean;
  sharedCollections: Collection[];
  refreshCollections: () => Promise<void>;
  fetchSharedCollections: () => Promise<void>;
  createCollection: (payload: Partial<Collection> & { name: string }) => Promise<Collection | null>;
  updateCollection: (collectionId: string, updates: Partial<Collection>) => Promise<Collection | null>;
  deleteCollection: (collectionId: string) => Promise<boolean>;
  reorderCollections: (orderedIds: string[]) => Promise<void>;
  addResourceToCollection: (collectionId: string, resourceId: string) => Promise<boolean>;
  removeResourceFromCollection: (collectionId: string, resourceId: string) => Promise<boolean>;
}

const CollectionsContext = createContext<CollectionsContextValue | undefined>(undefined);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [sharedCollections, setSharedCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);

  const uid = user?.uid;

  const fetchCollections = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/collections?uid=${uid}`);
      if (!response.ok) throw new Error('Failed to load collections');
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedCollections = async () => {
    try {
      const response = await fetch('/api/collections?shared=true');
      if (!response.ok) return;
      const data = await response.json();
      setSharedCollections(data.collections || []);
    } catch (error) {
      console.error('Error loading shared collections:', error);
    }
  };

  // Removed useEffect hooks to prevent automatic fetching on mount

  const refreshCollections = async () => {
    await fetchCollections();
  };

  const createCollection: CollectionsContextValue['createCollection'] = async (payload) => {
    if (!uid) return null;
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          name: payload.name,
          description: payload.description || '',
          icon: payload.icon || null,
          color: payload.color || null,
          is_shared: payload.is_shared ?? false,
          sort_order: collections.length ? Math.max(...collections.map((c) => c.sort_order ?? 0)) + 1 : Date.now(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create collection');
      const data = await response.json();
      const newCollection = data.collection as Collection;
      setCollections((prev) => [...prev, newCollection].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
      return newCollection;
    } catch (error) {
      console.error('Error creating collection:', error);
      return null;
    }
  };

  const updateCollection: CollectionsContextValue['updateCollection'] = async (collectionId, updates) => {
    if (!uid) return null;
    try {
      const response = await fetch('/api/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          collectionId,
          ...updates,
        }),
      });

      if (!response.ok) throw new Error('Failed to update collection');
      const data = await response.json();
      const updatedCollection = data.collection as Collection;
      setCollections((prev) => prev.map((collection) => (collection.id === collectionId ? updatedCollection : collection)));
      return updatedCollection;
    } catch (error) {
      console.error('Error updating collection:', error);
      return null;
    }
  };

  const deleteCollection: CollectionsContextValue['deleteCollection'] = async (collectionId) => {
    if (!uid) return false;
    try {
      const response = await fetch(`/api/collections?uid=${uid}&collectionId=${collectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete collection');
      setCollections((prev) => prev.filter((collection) => collection.id !== collectionId));
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  };

  const reorderCollections: CollectionsContextValue['reorderCollections'] = async (orderedIds) => {
    if (!uid) return;
    const updates = orderedIds.map((id, index) => ({ id, sort_order: index + 1 }));
    setCollections((prev) => {
      const map = new Map(prev.map((collection) => [collection.id, collection]));
      return orderedIds
        .map((id, index) => {
          const existing = map.get(id);
          if (!existing) return null;
          return { ...existing, sort_order: index + 1 };
        })
        .filter(Boolean) as Collection[];
    });

    await Promise.all(
      updates.map((item) =>
        fetch('/api/collections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, collectionId: item.id, sort_order: item.sort_order }),
        })
      )
    );
  };

  const addResourceToCollection: CollectionsContextValue['addResourceToCollection'] = async (collectionId, resourceId) => {
    if (!uid) return false;
    try {
      const response = await fetch('/api/collections/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, collectionId, resourceId }),
      });
      if (!response.ok) throw new Error('Failed to add resource to collection');
      return true;
    } catch (error) {
      console.error('Error adding resource to collection:', error);
      return false;
    }
  };

  const removeResourceFromCollection: CollectionsContextValue['removeResourceFromCollection'] = async (collectionId, resourceId) => {
    if (!uid) return false;
    try {
      const response = await fetch(`/api/collections/memberships?uid=${uid}&collectionId=${collectionId}&resourceId=${resourceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove resource from collection');
      return true;
    } catch (error) {
      console.error('Error removing resource from collection:', error);
      return false;
    }
  };

  const value: CollectionsContextValue = useMemo(() => ({
    collections,
    sharedCollections,
    loading,
    refreshCollections,
    fetchSharedCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    addResourceToCollection,
    removeResourceFromCollection,
  }), [collections, sharedCollections, loading]);

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
}
