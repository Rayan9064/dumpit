import { NextRequest, NextResponse } from 'next/server';
import { isAuthError, requireAuth, unauthorizedResponse } from '../_utils/auth';
import { getServerFirestore } from '../_utils/firebaseAdmin';
import { indexResource } from '../_utils/resourceIndexer';

// GET /api/public-resources - Get public resources from other users
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const db = getServerFirestore();

    // Get all public resources except current user's
    const publicResourcesQuery = await db.collection('resources')
      .where('is_public', '==', true)
      .where('user_id', '!=', authUser.uid)
      .orderBy('user_id')
      .orderBy('created_at', 'desc')
      .get();

    const resources = publicResourcesQuery.docs.map((doc: any) => ({
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

    console.error('Error fetching public resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/public-resources - Save a public resource to user's collection
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { resourceId } = await request.json();

    // Validate required fields
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Missing required field: resourceId' },
        { status: 400 }
      );
    }

    const db = getServerFirestore();

    // Get the original public resource
    const originalResource = await db.collection('resources').doc(resourceId).get();

    if (!originalResource.exists) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const resourceData = originalResource.data();
    if (!resourceData?.is_public || resourceData.user_id === authUser.uid) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Check if user already has this resource saved (by link)
    const existingResourceQuery = await db.collection('resources')
      .where('user_id', '==', authUser.uid)
      .where('link', '==', resourceData.link)
      .get();

    if (!existingResourceQuery.empty) {
      return NextResponse.json(
        { error: 'You already have this resource saved' },
        { status: 409 }
      );
    }

    // Save the resource to user's collection
    const newResourceData = {
      user_id: authUser.uid,
      title: resourceData.title,
      link: resourceData.link,
      note: resourceData.note,
      tag: resourceData.tag,
      is_public: false, // Always save as private
      collection_ids: [],
      index_status: 'pending',
      index_error: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const docRef = await db.collection('resources').add(newResourceData);
    const indexing = await indexResource({ resourceId: docRef.id, uid: authUser.uid });

    return NextResponse.json({
      success: true,
      message: 'Resource saved to your collection',
      resourceId: docRef.id,
      indexing,
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error saving public resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
