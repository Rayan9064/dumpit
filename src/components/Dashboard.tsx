'use client'

import { Edit, ExternalLink, FolderPlus, Globe, Loader2, Lock, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCollections, type Collection } from '../contexts/CollectionsContext';
import { CollectionsSidebar } from './collections/CollectionsSidebar';
import { ResourceCollectionManager } from './collections/ResourceCollectionManager';
import { EditResource } from './EditResource';

// Helper function to safely format dates
function formatDate(dateValue: any): string {
  if (!dateValue) return '';
  
  try {
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle string dates or timestamps
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}

interface Resource {
  id: string;
  user_id: string;
  title: string;
  link: string;
  note?: string;
  tag: string;
  is_public: boolean;
  created_at: Date | string | { toDate: () => Date };
  collection_ids?: string[];
}

export function Dashboard() {
  const [openMenuResourceId, setOpenMenuResourceId] = useState<string | null>(null);
  const handleMenuOpen = (resourceId: string) => {
    setOpenMenuResourceId(resourceId);
  };

  const handleMenuClose = () => {
    setOpenMenuResourceId(null);
  };
  const { user } = useAuth();
  const {
    collections,
    addResourceToCollection,
    removeResourceFromCollection,
  } = useCollections();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [tags, setTags] = useState<string[]>([]);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [managerResource, setManagerResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (user) {
      loadResources(selectedCollectionId);
    }
  }, [user, selectedCollectionId]);

  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedTag, resources]);

  useEffect(() => {
    setSelectedTag('all');
  }, [selectedCollectionId]);

  const loadResources = async (collectionId: string | null = selectedCollectionId) => {
    if (!user) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ uid: user.uid });
      if (collectionId) {
        queryParams.set('collectionId', collectionId);
      }

      const response = await fetch(`/api/resources?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to load resources');
      }

      const data = await response.json();
      const resourcesData = data.resources as Resource[];
      setResources(resourcesData);
      const uniqueTags = Array.from(new Set(resourcesData.map(r => r.tag)));
      setTags(uniqueTags);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
    setLoading(false);
  };

  const filterResources = () => {
    let filtered = [...resources];

    // If a collection is selected, only show resources that belong to it
    if (selectedCollectionId) {
      filtered = filtered.filter(r => (r.collection_ids || []).includes(selectedCollectionId));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.title.toLowerCase().includes(query) ||
          r.note?.toLowerCase().includes(query) ||
          r.link.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(r => r.tag === selectedTag);
    }

    setFilteredResources(filtered);
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const activeCollection = useMemo(() => (
    selectedCollectionId ? collections.find((collection) => collection.id === selectedCollectionId) : null
  ), [selectedCollectionId, collections]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {editingResource && (
        <EditResource
          resource={editingResource}
          onSuccess={() => {
            setEditingResource(null);
            loadResources();
          }}
          onCancel={() => setEditingResource(null)}
        />
      )}
      {managerResource && (
        <ResourceCollectionManager
          open
          resourceTitle={managerResource.title}
          collectionIds={managerResource.collection_ids || []}
          collections={collections}
          onClose={() => setManagerResource(null)}
          onApply={async (newCollectionIds) => {
            if (!managerResource) return;
            const resourceId = managerResource.id;
            // Find collections to add and remove
            const prevIds = managerResource.collection_ids || [];
            const toAdd = newCollectionIds.filter((id) => !prevIds.includes(id));
            const toRemove = prevIds.filter((id) => !newCollectionIds.includes(id));
            // Batch add/remove
            await Promise.all([
              ...toAdd.map((id) => addResourceToCollection(id, resourceId)),
              ...toRemove.map((id) => removeResourceFromCollection(id, resourceId)),
            ]);
            // Update local state
            setResources((prev) => prev.map((resource) => {
              if (resource.id !== resourceId) return resource;
              return { ...resource, collection_ids: newCollectionIds };
            }));
            setManagerResource((prev) => prev ? { ...prev, collection_ids: newCollectionIds } : prev);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 overflow-x-hidden">
        <div className="pt-8 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{resources.length} resources{activeCollection ? ` in "${activeCollection.name}"` : ' total'}</p>
        </div>

	  <div className="lg:flex lg:items-start lg:gap-8">
		  <div className="lg:shrink-0">
            <CollectionsSidebar
              activeCollectionId={selectedCollectionId}
              onSelect={(collectionId) => setSelectedCollectionId(collectionId)}
            />
          </div>

		  <main className="min-w-0 flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="w-40 shrink-0">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full pl-2 pr-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="all">All Tags</option>
                    {tags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No resources found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {resources.length === 0
                    ? "Start by adding your first resource!"
                    : "Try adjusting your search or filter"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => {
                  const assignedCollections = (resource.collection_ids || [])
                    .map((id) => collections.find((collection) => collection.id === id))
                    .filter((collection): collection is Collection => Boolean(collection))
                    .slice(0, 3);
                  const totalAssignments = resource.collection_ids?.length ?? 0;
                  const remainingCount = totalAssignments - assignedCollections.length;
                  return (
                    <article
                      key={resource.id}
                      className="min-w-0 min-h-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-150 relative"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-medium">
                            {resource.tag}
                          </span>
                          {resource.is_public ? (
                            <Globe className="w-4 h-4 text-green-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => handleMenuOpen(resource.id)}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded-full focus:outline-none"
                            title="More actions"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openMenuResourceId === resource.id && (
                            <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg bg-white shadow-lg border border-slate-200 py-1">
                              <button onClick={() => { setEditingResource(resource); handleMenuClose(); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"><Edit className="w-4 h-4"/> Edit</button>
                              <button onClick={() => { setManagerResource(resource); handleMenuClose(); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"><FolderPlus className="w-4 h-4"/> Collections</button>
                              <button onClick={() => { deleteResource(resource.id); handleMenuClose(); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/> Delete</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 my-3 line-clamp-2">{resource.title}</h3>

                      {resource.note && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{resource.note}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"><ExternalLink className="w-4 h-4"/> Visit Link</a>
                        <div className="flex items-center gap-2">
                          {assignedCollections.map((collection) => (
                            <span key={collection.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: collection.color || '#2563eb' }}>{collection.icon || '🗂️'} {collection.name}</span>
                          ))}
                          {remainingCount > 0 && <span className="text-xs text-slate-500">+{remainingCount}</span>}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">{formatDate(resource.created_at)}</div>
                    </article>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
