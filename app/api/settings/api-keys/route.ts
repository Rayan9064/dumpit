import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { API_KEY_PREFIX, hashApiKey, isAuthError, requireAuth, unauthorizedResponse } from '../../_utils/auth';
import { getServerFirestore } from '../../_utils/firebaseAdmin';

// GET /api/settings/api-keys - List the authenticated user's API keys (masked)
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const db = getServerFirestore();

    const snapshot = await db.collection('api_keys')
      .where('uid', '==', authUser.uid)
      .orderBy('created_at', 'desc')
      .get();

    const keys = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        prefix: data.prefix,
        label: data.label || null,
        created_at: data.created_at,
        last_used_at: data.last_used_at || null,
      };
    });

    return NextResponse.json({ success: true, keys });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error listing API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/settings/api-keys - Generate a new API key (raw key returned once)
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json().catch(() => ({}));
    const label = typeof body.label === 'string' ? body.label.slice(0, 60) : null;

    const db = getServerFirestore();

    // Cap at 5 keys per user to keep this lightweight
    const existing = await db.collection('api_keys').where('uid', '==', authUser.uid).select().get();
    if (existing.size >= 5) {
      return NextResponse.json(
        { error: 'API key limit (5) reached. Revoke an existing key first.' },
        { status: 400 }
      );
    }

    const rawKey = `${API_KEY_PREFIX}${randomBytes(24).toString('hex')}`;
    const hash = hashApiKey(rawKey);
    const prefix = `${rawKey.slice(0, API_KEY_PREFIX.length + 6)}...`;
    const now = new Date();

    const keyRef = db.collection('api_keys').doc();
    await keyRef.set({
      uid: authUser.uid,
      hash,
      prefix,
      label,
      created_at: now,
      last_used_at: null,
    });

    return NextResponse.json({
      success: true,
      key: rawKey,
      id: keyRef.id,
      prefix,
      message: 'Save this key now — it will not be shown again.',
    });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/settings/api-keys?id=<keyId> - Revoke an API key
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const db = getServerFirestore();
    const keyRef = db.collection('api_keys').doc(id);
    const snapshot = await keyRef.get();

    if (!snapshot.exists || snapshot.data()?.uid !== authUser.uid) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await keyRef.delete();

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error revoking API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
