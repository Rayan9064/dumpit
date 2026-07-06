import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { isAuthError, requireAuth, unauthorizedResponse } from '../_utils/auth';
import { getServerFirestore } from '../_utils/firebaseAdmin';

const COLLECTION_SUBPATH = 'collections';

const buildCollectionData = (raw: any) => ({
  id: raw.id,
  name: raw.name,
  description: raw.description || '',
  icon: raw.icon || null,
  color: raw.color || null,
  is_shared: Boolean(raw.is_shared),
  sort_order: typeof raw.sort_order === 'number' ? raw.sort_order : null,
  created_at: raw.created_at || null,
  updated_at: raw.updated_at || null,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sharedOnly = searchParams.get('shared') === 'true';

    const db = getServerFirestore();

    if (sharedOnly) {
      const snapshot = await db
        .collectionGroup(COLLECTION_SUBPATH)
        .where('is_shared', '==', true)
        .orderBy('sort_order', 'asc')
        .get();

      const collections = snapshot.docs.map((doc) => (
        buildCollectionData({ id: doc.id, ...doc.data() })
      ));

      return NextResponse.json({ success: true, collections });
    }

    const authUser = await requireAuth(request);

    const collectionsRef = db.collection('users').doc(authUser.uid).collection(COLLECTION_SUBPATH);
    const snapshot = await collectionsRef.orderBy('sort_order', 'asc').get();

    const collections = snapshot.docs.map((doc) => (
      buildCollectionData({ id: doc.id, ...doc.data() })
    ));

    return NextResponse.json({ success: true, collections });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { name, description, icon, color, is_shared, sort_order } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    const db = getServerFirestore();
    const collectionsRef = db.collection('users').doc(authUser.uid).collection(COLLECTION_SUBPATH);
    const now = new Date();

    const docRef = collectionsRef.doc();
    const collectionData = {
      name,
      description: description || '',
      icon: icon || null,
      color: color || null,
      is_shared: Boolean(is_shared),
      sort_order: typeof sort_order === 'number' ? sort_order : Date.now(),
      created_at: now,
      updated_at: now,
    };

    await docRef.set(collectionData);

    return NextResponse.json({
      success: true,
      collection: buildCollectionData({ id: docRef.id, ...collectionData }),
    });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { collectionId, id, name, description, icon, color, is_shared, sort_order } = await request.json();
    const targetCollectionId = collectionId || id;

    if (!targetCollectionId) {
      return NextResponse.json({ error: 'Missing required field: collectionId' }, { status: 400 });
    }

    const db = getServerFirestore();
    const docRef = db.collection('users').doc(authUser.uid).collection(COLLECTION_SUBPATH).doc(targetCollectionId);

    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (typeof name === 'string') updateData.name = name;
    if (typeof description === 'string') updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (typeof is_shared === 'boolean') updateData.is_shared = is_shared;
    if (typeof sort_order === 'number') updateData.sort_order = sort_order;

    await docRef.set(updateData, { merge: true });

    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      collection: buildCollectionData({ id: updatedDoc.id, ...updatedDoc.data() })
    });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error updating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 });
    }

    const db = getServerFirestore();
    const batch = db.batch();
    const now = new Date();

    orderedIds.forEach((collectionId, index) => {
      if (typeof collectionId !== 'string') return;
      const docRef = db.collection('users').doc(authUser.uid).collection(COLLECTION_SUBPATH).doc(collectionId);
      batch.set(docRef, {
        sort_order: index,
        updated_at: now,
      }, { merge: true });
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error reordering collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId') || searchParams.get('id');

    if (!collectionId) {
      return NextResponse.json({ error: 'Missing collectionId parameter' }, { status: 400 });
    }

    const db = getServerFirestore();
    const docRef = db.collection('users').doc(authUser.uid).collection(COLLECTION_SUBPATH).doc(collectionId);
    const resourcesSnapshot = await docRef.collection('resources').get();

    const batch = db.batch();

    resourcesSnapshot.forEach((resourceDoc) => {
      batch.delete(resourceDoc.ref);
      batch.set(db.collection('resources').doc(resourceDoc.id), {
        collection_ids: FieldValue.arrayRemove(collectionId),
        updated_at: new Date(),
      }, { merge: true });
    });

    batch.delete(docRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
