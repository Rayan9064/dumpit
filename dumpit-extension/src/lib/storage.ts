export interface StorageData {
  apiBaseUrl?: string;
  savedCollections?: Array<{ id: string; name: string }>;
}

export const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export async function getApiBaseUrl(): Promise<string> {
  try {
    const data = await chrome.storage.local.get('apiBaseUrl');
    return data.apiBaseUrl || import.meta.env.VITE_DUMPIT_API_URL || DEFAULT_API_BASE_URL;
  } catch (e) {
    return DEFAULT_API_BASE_URL;
  }
}

export async function setApiBaseUrl(url: string): Promise<void> {
  await chrome.storage.local.set({ apiBaseUrl: url });
}

export async function getSavedCollections(): Promise<Array<{ id: string; name: string }>> {
  const data = await chrome.storage.local.get('savedCollections');
  return data.savedCollections || [];
}

export async function setSavedCollections(collections: Array<{ id: string; name: string }>): Promise<void> {
  await chrome.storage.local.set({ savedCollections: collections });
}
