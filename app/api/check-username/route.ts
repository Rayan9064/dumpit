import { NextRequest, NextResponse } from 'next/server';
import { getServerFirestore } from '../_utils/firebaseAdmin';

const usernameRegex = /^[a-z0-9_-]{3,20}$/;

const checkUsername = async (username: unknown) => {
  if (!username || typeof username !== 'string') {
    return NextResponse.json(
      { available: false, error: 'Invalid username' },
      { status: 400 }
    );
  }

  if (!usernameRegex.test(username)) {
    return NextResponse.json({
      available: false,
      error: 'Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.'
    });
  }

  const firestoreDb = getServerFirestore();
  const snapshot = await firestoreDb.collection('users')
    .where('username', '==', username)
    .limit(1)
    .get();

  return NextResponse.json({ available: snapshot.empty });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    return await checkUsername(searchParams.get('username'));
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { available: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    return await checkUsername(username);
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { available: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
