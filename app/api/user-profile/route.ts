import { NextRequest, NextResponse } from 'next/server';
import { isAuthError, requireAuth, unauthorizedResponse } from '../_utils/auth';
import { getServerFirestore } from '../_utils/firebaseAdmin';

const usernameRegex = /^[a-z0-9_-]{3,20}$/;

const getProfileStats = async (db: FirebaseFirestore.Firestore, uid: string) => {
  const resourcesQuery = await db.collection('resources')
    .where('user_id', '==', uid)
    .get();

  const allResources = resourcesQuery.docs.map((doc) => doc.data());
  const publicCount = allResources.filter((resource) => resource.is_public).length;

  return {
    resource_count: allResources.length,
    public_resource_count: publicCount,
  };
};

// POST /api/user-profile - Create or update the authenticated user's profile
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { username, email, share_by_default } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Missing required field: username' },
        { status: 400 }
      );
    }

    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        error: 'Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.'
      }, { status: 400 });
    }

    const db = getServerFirestore();

    const usernameQuery = await db.collection('users')
      .where('username', '==', username)
      .where('id', '!=', authUser.uid)
      .get();

    if (!usernameQuery.empty) {
      return NextResponse.json({
        error: 'Username is already taken'
      }, { status: 409 });
    }

    const userRef = db.collection('users').doc(authUser.uid);
    const existingProfile = await userRef.get();
    const now = new Date();

    const userData = {
      id: authUser.uid,
      username,
      email: email || authUser.email || '',
      share_by_default: share_by_default ?? false,
      created_at: existingProfile.exists ? existingProfile.data()?.created_at || now : now,
      updated_at: now,
    };

    await userRef.set(userData, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'User profile created/updated successfully'
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error creating/updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/user-profile?type=<profile|stats> - Get authenticated user's profile or stats
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const db = getServerFirestore();

    if (type === 'stats') {
      return NextResponse.json({
        success: true,
        stats: await getProfileStats(db, authUser.uid),
      });
    }

    const userDoc = await db.collection('users').doc(authUser.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const profile = userDoc.data();
    const stats = await getProfileStats(db, authUser.uid);

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        ...stats,
      }
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user-profile - Update authenticated user's profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { username, share_by_default } = await request.json();

    if (username && !usernameRegex.test(username)) {
      return NextResponse.json({
        error: 'Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.'
      }, { status: 400 });
    }

    const db = getServerFirestore();

    if (username) {
      const usernameQuery = await db.collection('users')
        .where('username', '==', username)
        .where('id', '!=', authUser.uid)
        .get();

      if (!usernameQuery.empty) {
        return NextResponse.json({
          error: 'Username is already taken'
        }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (username !== undefined) updateData.username = username;
    if (share_by_default !== undefined) updateData.share_by_default = share_by_default;

    await db.collection('users').doc(authUser.uid).set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'User profile updated successfully'
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
