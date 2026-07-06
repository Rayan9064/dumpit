import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { isAuthError, requireAuth, unauthorizedResponse } from '../../_utils/auth';
import { getServerFirestore } from '../../_utils/firebaseAdmin';

const COLLECTION_SUBPATH = 'collections';

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { collectionId, resourceId } = await request.json();

    if (!collectionId || !resourceId) {
      return NextResponse.json({ error: 'Missing required fields: collectionId, resourceId' }, { status: 400 });
    }

    const db = getServerFirestore();
    const collectionDoc = db.collection('users').doc(authUser.uid).collection(COLLECTION_SUBPATH).doc(collectionId);
    const resourceDoc = db.collection('resources').doc(resourceId);

    const [collectionSnapshot, resourceSnapshot] = await Promise.all([
      collectionDoc.get(),
      resourceDoc.get(),
    ]);

    if (!collectionSnapshot.exists) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (!resourceSnapshot.exists || resourceSnapshot.data()?.user_id !== authUser.uid) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    await db.runTransaction(async (transaction) => {
      const membershipRef = collectionDoc.collection('resources').doc(resourceId);
      transaction.set(membershipRef, {
        resource_id: resourceId,
        added_at: new Date(),
      });

      transaction.set(resourceDoc, {
        collection_ids: FieldValue.arrayUnion(collectionId),
        updated_at: new Date(),
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error adding resource to collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const collectionId = body.collectionId || searchParams.get('collectionId');
    const resourceId = body.resourceId || searchParams.get('resourceId');

    if (!collectionId || !resourceId) {
      return NextResponse.json({ error: 'Missing collectionId or resourceId' }, { status: 400 });
    }

    const db = getServerFirestore();
    const collectionDoc = db.collection('users').doc(authUser.uid).collection(COLLECTION_SUBPATH).doc(collectionId);
    const resourceDoc = db.collection('resources').doc(resourceId);

    const resourceSnapshot = await resourceDoc.get();
    if (!resourceSnapshot.exists || resourceSnapshot.data()?.user_id !== authUser.uid) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    await db.runTransaction(async (transaction) => {
      const membershipRef = collectionDoc.collection('resources').doc(resourceId);
      transaction.delete(membershipRef);
      transaction.set(resourceDoc, {
        collection_ids: FieldValue.arrayRemove(collectionId),
        updated_at: new Date(),
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error removing resource from collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
