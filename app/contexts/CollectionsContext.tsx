'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Collection {
  id: string;
  uid: string;
  name: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  is_shared: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  resource_ids?: string[];
}

interface CollectionsContextValue {
  collections: Collection[];
  sharedCollections: Collection[];
  loading: boolean;
  /** Call this manually to fetch user collections (not auto-fetched) */
  fetchCollections: () => Promise<void>;
  /** Call this manually to fetch shared collections */
  fetchSharedCollections: () => Promise<void>;
  refreshCollections: () => Promise<void>;
  createCollection: (payload: { name: string; description?: string; icon?: string; color?: string; is_shared?: boolean }) => Promise<Collection | null>;
  updateCollection: (id: string, payload: Partial<Collection>) => Promise<boolean>;
  deleteCollection: (id: string) => Promise<boolean>;
  reorderCollections: (orderedIds: string[]) => Promise<boolean>;
  addResourceToCollection: (collectionId: string, resourceId: string) => Promise<boolean>;
  removeResourceFromCollection: (collectionId: string, resourceId: string) => Promise<boolean>;
}

const CollectionsContext = createContext<CollectionsContextValue | undefined>(undefined);

interface CollectionsProviderProps {
  children: ReactNode;
  /** If true, collections will be fetched on mount. Defaults to false. */
  fetchOnMount?: boolean;
}

export function CollectionsProvider({ children, fetchOnMount = false }: CollectionsProviderProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [sharedCollections, setSharedCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const CACHE_DURATION_MS = 30000; // 30 seconds cache

  const uid = user?.uid;

  const fetchCollections = useCallback(async () => {
    if (!uid) return;
    const now = Date.now();
    // Only fetch if cache has expired
    if (now - lastFetchTimeRef.current < CACHE_DURATION_MS && collections.length > 0) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/collections?uid=${uid}`);
      if (!response.ok) throw new Error('Failed to load collections');
      const data = await response.json();
      setCollections(data.collections || []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  }, [uid, collections.length]);

  const fetchSharedCollections = useCallback(async () => {
    try {
      const response = await fetch('/api/collections?shared=true');
      if (!response.ok) return;
      const data = await response.json();
      setSharedCollections(data.collections || []);
    } catch (error) {
      console.error('Error loading shared collections:', error);
    }
  }, []);

  // Only auto-fetch if fetchOnMount is true AND we haven't fetched yet
  useEffect(() => {
    if (fetchOnMount && uid && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCollections();
    }
  }, [fetchOnMount, uid, fetchCollections]);

  // Reset hasFetched when uid changes (user logs out/in)
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [uid]);

  const refreshCollections = useCallback(async () => {
    await fetchCollections();
  }, [fetchCollections]);

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
      await refreshCollections();
      return data.collection;
    } catch (error) {
      console.error('Error creating collection:', error);
      return null;
    }
  };

  const updateCollection: CollectionsContextValue['updateCollection'] = async (id, payload) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
      if (!response.ok) throw new Error('Failed to update collection');
      await refreshCollections();
      return true;
    } catch (error) {
      console.error('Error updating collection:', error);
      return false;
    }
  };

  const deleteCollection: CollectionsContextValue['deleteCollection'] = async (id) => {
    try {
      const response = await fetch(`/api/collections?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete collection');
      await refreshCollections();
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  };

  const reorderCollections: CollectionsContextValue['reorderCollections'] = async (orderedIds) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) throw new Error('Failed to reorder collections');
      await refreshCollections();
      return true;
    } catch (error) {
      console.error('Error reordering collections:', error);
      return false;
    }
  };

  const addResourceToCollection: CollectionsContextValue['addResourceToCollection'] = async (collectionId, resourceId) => {
    try {
      const response = await fetch('/api/collections/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, resourceId }),
      });
      if (!response.ok) throw new Error('Failed to add resource to collection');
      return true;
    } catch (error) {
      console.error('Error adding resource to collection:', error);
      return false;
    }
  };

  const removeResourceFromCollection: CollectionsContextValue['removeResourceFromCollection'] = async (collectionId, resourceId) => {
    try {
      const response = await fetch('/api/collections/memberships', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, resourceId }),
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
    fetchCollections,
    fetchSharedCollections,
    refreshCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    addResourceToCollection,
    removeResourceFromCollection,
  }), [collections, sharedCollections, loading, fetchCollections, fetchSharedCollections, refreshCollections]);

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
}
