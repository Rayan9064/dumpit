import { embedText } from './gemini';
import { getServerFirestore } from './firebaseAdmin';

export type SearchMode = 'mine' | 'shared' | 'all';

export interface SearchResult {
  chunkId: string;
  resourceId: string;
  title: string;
  url: string;
  snippet: string;
  tag: string;
  isPublic: boolean;
  ownerId: string;
  distance: number | null;
}

export const normalizeSearchMode = (mode: unknown): SearchMode => (
  mode === 'mine' || mode === 'shared' || mode === 'all' ? mode : 'all'
);

export const isAuthorizedChunk = (chunk: { user_id?: string; is_public?: boolean }, uid: string, mode: SearchMode) => {
  if (mode === 'mine') {
    return chunk.user_id === uid;
  }

  if (mode === 'shared') {
    return Boolean(chunk.is_public) && chunk.user_id !== uid;
  }

  return chunk.user_id === uid || Boolean(chunk.is_public);
};

const runVectorSearch = async (
  uid: string,
  queryVector: number[],
  mode: Exclude<SearchMode, 'all'>,
  limit: number
): Promise<SearchResult[]> => {
  const db = getServerFirestore();
  let firestoreQuery: FirebaseFirestore.Query = db.collection('resource_chunks');

  if (mode === 'mine') {
    firestoreQuery = firestoreQuery.where('user_id', '==', uid);
  } else {
    firestoreQuery = firestoreQuery
      .where('is_public', '==', true)
      .where('user_id', '!=', uid);
  }

  const vectorQuery = firestoreQuery.findNearest({
    vectorField: 'embedding',
    queryVector,
    limit,
    distanceMeasure: 'COSINE',
    distanceResultField: 'distance',
  });

  const snapshot = await vectorQuery.get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();

      return {
        chunkId: doc.id,
        resourceId: data.resource_id || '',
        title: data.title || 'Untitled',
        url: data.source_url || '',
        snippet: data.summary || data.chunk_text || '',
        tag: data.tag || 'Article',
        isPublic: Boolean(data.is_public),
        ownerId: data.user_id || '',
        distance: typeof data.distance === 'number' ? data.distance : null,
      };
    })
    .filter((result) => (
      result.resourceId &&
      result.url &&
      isAuthorizedChunk({ user_id: result.ownerId, is_public: result.isPublic }, uid, mode)
    ));
};

export const searchResourceChunks = async (
  uid: string,
  query: string,
  mode: SearchMode,
  limit = 8
) => {
  const queryVector = await embedText(query);
  const boundedLimit = Math.min(Math.max(limit, 1), 20);

  if (mode === 'all') {
    const [mine, shared] = await Promise.all([
      runVectorSearch(uid, queryVector, 'mine', boundedLimit),
      runVectorSearch(uid, queryVector, 'shared', boundedLimit),
    ]);

    const merged = new Map<string, SearchResult>();
    [...mine, ...shared].forEach((result) => {
      const existing = merged.get(result.chunkId);
      if (!existing || ((result.distance ?? Infinity) < (existing.distance ?? Infinity))) {
        merged.set(result.chunkId, result);
      }
    });

    return [...merged.values()]
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      .slice(0, boundedLimit);
  }

  return runVectorSearch(uid, queryVector, mode, boundedLimit);
};

export const buildAnswerContext = (results: SearchResult[]) => (
  results.map((result, index) => [
    `[${index + 1}] ${result.title}`,
    `URL: ${result.url}`,
    `Visibility: ${result.isPublic ? 'public' : 'private'}`,
    `Snippet: ${result.snippet}`,
  ].join('\n')).join('\n\n')
);
