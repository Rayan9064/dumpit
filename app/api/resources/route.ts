import { NextRequest, NextResponse } from 'next/server';
import { isAuthError, requireAuth, unauthorizedResponse } from '../_utils/auth';
import { getServerFirestore } from '../_utils/firebaseAdmin';
import { getPreviewFromUrl } from '../_utils/linkPreview';
import { indexResource } from '../_utils/resourceIndexer';

// GET /api/resources - Get the authenticated user's resources
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    const db = getServerFirestore();

    let query: FirebaseFirestore.Query = db.collection('resources')
      .where('user_id', '==', authUser.uid);

    if (collectionId) {
      query = query.where('collection_ids', 'array-contains', collectionId);
    }

    const resourcesQuery = await query.orderBy('created_at', 'desc').get();

    const resources = resourcesQuery.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      resources
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();
    const { title, link, note, tag, is_public, collection_ids, new_collection, captured_text } = body;

    // Validate required fields
    if (!link) {
      return NextResponse.json(
        { error: 'Missing required field: link' },
        { status: 400 }
      );
    }

    // Validate link format
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Link must start with http:// or https://' },
        { status: 400 }
      );
    }

    // If title or tag is missing, attempt to auto-enrich from link
    let enrichedTitle = title;
    let enrichedTag = tag;
    if (!enrichedTitle || !enrichedTag) {
      try {
        const metadata = await getPreviewFromUrl(link);
        if (!enrichedTitle && metadata.title) enrichedTitle = metadata.title;
        if (!enrichedTag && metadata.suggestedTag) enrichedTag = metadata.suggestedTag;
      } catch (err) {
        console.warn('Failed to enrich link:', err);
      }
    }

    const db = getServerFirestore();

    const normalizedCollectionIds: string[] = Array.isArray(collection_ids)
      ? collection_ids.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
      : [];

    const resourceRef = db.collection('resources').doc();
    const now = new Date();

    const resourceData = {
      user_id: authUser.uid,
      title: enrichedTitle,
      link,
      note: note || null,
      tag: enrichedTag || 'Article',
      is_public: is_public ?? false,
      collection_ids: normalizedCollectionIds,
      captured_text: captured_text || null,
      index_status: 'pending',
      index_error: null,
      created_at: now,
      updated_at: now,
    };

    let createdCollectionId: string | null = null;
    await db.runTransaction(async (transaction) => {
      // If a new collection was provided, create it first and include its id
      if (new_collection && typeof new_collection === 'object') {
        if (!new_collection.name || typeof new_collection.name !== 'string') {
          throw new Error('new_collection.name is required and must be a string');
        }
        const collectionsRef = db.collection('users').doc(authUser.uid).collection('collections');
        const collectionRef = collectionsRef.doc();
        const collectionData: any = {
          name: new_collection.name,
          description: new_collection.description || '',
          icon: new_collection.icon || null,
          color: new_collection.color || null,
          is_shared: Boolean(new_collection.is_shared || false),
          sort_order: typeof new_collection.sort_order === 'number' ? new_collection.sort_order : Date.now(),
          created_at: now,
          updated_at: now,
        };

        transaction.set(collectionRef, collectionData);
        normalizedCollectionIds.push(collectionRef.id);
        createdCollectionId = collectionRef.id;
      }

      transaction.set(resourceRef, resourceData);

      normalizedCollectionIds.forEach((collectionId: string) => {
          const membershipRef = db
            .collection('users')
          .doc(authUser.uid)
          .collection('collections')
          .doc(collectionId)
          .collection('resources')
          .doc(resourceRef.id);

        transaction.set(membershipRef, {
          resource_id: resourceRef.id,
          added_at: now,
        });
      });
    });

    const indexing = await indexResource({ resourceId: resourceRef.id, uid: authUser.uid });

    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resourceId: resourceRef.id,
      createdCollectionId,
      indexing,
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/resources - Update resource
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { id, title, link, note, tag, is_public, collection_ids } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Validate link format if provided
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Link must start with http:// or https://' },
        { status: 400 }
      );
    }

    const db = getServerFirestore();
    const resourceRef = db.collection('resources').doc(id);

    const existingSnapshot = await resourceRef.get();
    if (!existingSnapshot.exists) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const existingData = existingSnapshot.data() || {};
    if (existingData.user_id !== authUser.uid) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const existingCollectionIds: string[] = Array.isArray(existingData.collection_ids)
      ? existingData.collection_ids
      : [];

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (note !== undefined) updateData.note = note || null;
    if (tag !== undefined) updateData.tag = tag;
    if (is_public !== undefined) updateData.is_public = is_public;
    updateData.updated_at = new Date();

    let normalizedCollectionIds: string[] | undefined;

    if (collection_ids !== undefined) {
      normalizedCollectionIds = Array.isArray(collection_ids)
        ? collection_ids.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];
      updateData.collection_ids = normalizedCollectionIds;
    }

    const userId = existingData.user_id;

    await db.runTransaction(async (transaction) => {
      transaction.update(resourceRef, updateData);

      if (normalizedCollectionIds && userId) {
        const toAdd = normalizedCollectionIds.filter((id) => !existingCollectionIds.includes(id));
        const toRemove = existingCollectionIds.filter((id) => !normalizedCollectionIds!.includes(id));

        const now = new Date();

        toAdd.forEach((collectionId) => {
          const membershipRef = db
            .collection('users')
            .doc(userId)
            .collection('collections')
            .doc(collectionId)
            .collection('resources')
            .doc(resourceRef.id);
          transaction.set(membershipRef, {
            resource_id: resourceRef.id,
            added_at: now,
          });
        });

        toRemove.forEach((collectionId) => {
          const membershipRef = db
            .collection('users')
            .doc(userId)
            .collection('collections')
            .doc(collectionId)
            .collection('resources')
            .doc(resourceRef.id);
          transaction.delete(membershipRef);
        });
      }
    });

    let indexing: Awaited<ReturnType<typeof indexResource>> | null = null;
    if (
      link !== undefined ||
      title !== undefined ||
      note !== undefined ||
      tag !== undefined ||
      is_public !== undefined
    ) {
      indexing = await indexResource({ resourceId: id, uid: authUser.uid });
    }

    return NextResponse.json({
      success: true,
      message: 'Resource updated successfully',
      indexing,
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources?id=<resourceId> - Delete resource
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const db = getServerFirestore();
    const resourceRef = db.collection('resources').doc(id);
    const snapshot = await resourceRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const data = snapshot.data() || {};
    const userId: string | undefined = data.user_id;
    if (userId !== authUser.uid) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const collectionIds: string[] = Array.isArray(data.collection_ids) ? data.collection_ids : [];
    const chunksSnapshot = await db.collection('resource_chunks')
      .where('resource_id', '==', id)
      .get();

    await db.runTransaction(async (transaction) => {
      if (userId && collectionIds.length > 0) {
        collectionIds.forEach((collectionId) => {
          const membershipRef = db
            .collection('users')
            .doc(userId)
            .collection('collections')
            .doc(collectionId)
            .collection('resources')
            .doc(id);
          transaction.delete(membershipRef);
        });
      }

      chunksSnapshot.docs.forEach((chunkDoc) => {
        transaction.delete(chunkDoc.ref);
      });

      transaction.delete(resourceRef);
    });

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
