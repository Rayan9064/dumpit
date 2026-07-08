import { getApiBaseUrl } from './storage';

export interface SaveResourcePayload {
  title: string;
  link: string;
  note: string;
  tag: string;
  is_public: boolean;
  collection_ids?: string[];
}

export interface CapturePayload extends SaveResourcePayload {
  captured_text?: string;
  selected_text?: string;
  canonical_url?: string;
  source_type?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
}

async function getHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function saveResource(token: string, payload: SaveResourcePayload): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = await getApiBaseUrl();
    const headers = await getHeaders(token);
    const response = await fetch(`${baseUrl}/api/resources`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error || `Server responded with status ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

export async function captureExtensionResource(token: string, payload: CapturePayload): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = await getApiBaseUrl();
    const headers = await getHeaders(token);
    // Send to /api/extension/capture if it exists, fallback to standard resources endpoint
    const endpoint = `${baseUrl}/api/extension/capture`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Fallback to normal saveResource since /api/extension/capture might not be implemented yet
        return saveResource(token, {
          title: payload.title,
          link: payload.link,
          note: payload.note,
          tag: payload.tag,
          is_public: payload.is_public,
          collection_ids: payload.collection_ids
        });
      }
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error || `Server responded with status ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

export async function fetchCollections(token: string): Promise<Collection[]> {
  try {
    const baseUrl = await getApiBaseUrl();
    const headers = await getHeaders(token);
    const response = await fetch(`${baseUrl}/api/collections`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }

    const data = await response.json();
    return data.collections || [];
  } catch (err) {
    console.error('Error fetching collections:', err);
    return [];
  }
}
