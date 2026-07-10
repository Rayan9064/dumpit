import { FieldValue } from 'firebase-admin/firestore';
import { embedText, hasGeminiApiKey, summarizeChunk } from './gemini';
import { getServerFirestore } from './firebaseAdmin';
import { chunkText, fetchReadableText } from './textExtraction';

interface ResourceData {
  title?: string;
  link?: string;
  note?: string | null;
  tag?: string;
  user_id?: string;
  is_public?: boolean;
  captured_text?: string | null;
}

export interface IndexResourceOptions {
  resourceId: string;
  uid: string;
}

const CHUNKS_COLLECTION = 'resource_chunks';

const buildFallbackText = (resource: ResourceData) => (
  [resource.title, resource.note, resource.link]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join('\n\n')
);

export const indexResource = async ({ resourceId, uid }: IndexResourceOptions) => {
  const db = getServerFirestore();
  const resourceRef = db.collection('resources').doc(resourceId);
  const resourceSnapshot = await resourceRef.get();

  if (!resourceSnapshot.exists) {
    throw new Error('Resource not found');
  }

  const resource = resourceSnapshot.data() as ResourceData;
  if (resource.user_id !== uid) {
    throw new Error('Resource not found');
  }

  if (!resource.link) {
    await resourceRef.set({
      index_status: 'skipped',
      index_error: 'Missing link',
      updated_at: new Date(),
    }, { merge: true });
    return { status: 'skipped', chunksIndexed: 0 };
  }

  if (!hasGeminiApiKey()) {
    await resourceRef.set({
      index_status: 'skipped',
      index_error: 'Missing GEMINI_API_KEY',
      updated_at: new Date(),
    }, { merge: true });
    return { status: 'skipped', chunksIndexed: 0 };
  }

  await resourceRef.set({
    index_status: 'pending',
    index_error: null,
    updated_at: new Date(),
  }, { merge: true });

  try {
    let combinedText = '';
    let extractedTitle = '';

    if (resource.captured_text) {
      combinedText = [resource.title, resource.note, resource.captured_text]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .join('\n\n');
      extractedTitle = resource.title || '';
    } else {
      const extracted = await fetchReadableText(resource.link);
      combinedText = [resource.title, resource.note, extracted.title, extracted.text]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .join('\n\n');
      extractedTitle = extracted.title || '';
    }

    const chunks = chunkText(combinedText || buildFallbackText(resource));

    if (chunks.length === 0) {
      throw new Error('No readable text found for this resource');
    }

    const existingChunks = await db.collection(CHUNKS_COLLECTION)
      .where('resource_id', '==', resourceId)
      .get();
    const deleteBatch = db.batch();
    existingChunks.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const embedding = await embedText(chunk);

      await db.collection(CHUNKS_COLLECTION).add({
        resource_id: resourceId,
        user_id: uid,
        is_public: Boolean(resource.is_public),
        title: resource.title || extractedTitle || 'Untitled',
        source_url: resource.link,
        tag: resource.tag || 'Article',
        chunk_text: chunk,
        chunk_index: index,
        summary: summarizeChunk(chunk),
        embedding: FieldValue.vector(embedding),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await resourceRef.set({
      index_status: 'indexed',
      index_error: null,
      indexed_at: new Date(),
      updated_at: new Date(),
    }, { merge: true });

    return { status: 'indexed', chunksIndexed: chunks.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Indexing failed';
    await resourceRef.set({
      index_status: 'failed',
      index_error: message,
      updated_at: new Date(),
    }, { merge: true });

    return { status: 'failed', chunksIndexed: 0, error: message };
  }
};
