import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getServerAuth, getServerFirestore } from './firebaseAdmin';

export const API_KEY_PREFIX = 'dk_live_';

export class AuthError extends Error {
  status = 401;

  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export const unauthorizedResponse = () => (
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
);

export const getBearerToken = (request: NextRequest): string | null => {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  const token = header.slice('Bearer '.length).trim();
  return token || null;
};

export const requireAuth = async (request: NextRequest): Promise<DecodedIdToken> => {
  const token = getBearerToken(request);
  if (!token) {
    throw new AuthError();
  }

  try {
    return await getServerAuth().verifyIdToken(token);
  } catch {
    throw new AuthError();
  }
};

export const isAuthError = (error: unknown): error is AuthError => (
  error instanceof AuthError
);

export const hashApiKey = (rawKey: string): string => (
  createHash('sha256').update(rawKey).digest('hex')
);

/**
 * Resolves the caller's uid from either a Firebase ID token (dashboard/web app)
 * or a long-lived `dk_live_...` API key (external API / MCP server clients).
 * Firebase ID tokens expire in ~1hr and can't power a persistent MCP config,
 * hence the separate API key path.
 */
export const requireAuthOrApiKey = async (request: NextRequest): Promise<{ uid: string }> => {
  const token = getBearerToken(request);
  if (!token) {
    throw new AuthError();
  }

  if (token.startsWith(API_KEY_PREFIX)) {
    const db = getServerFirestore();
    const hash = hashApiKey(token);
    const snapshot = await db.collection('api_keys').where('hash', '==', hash).limit(1).get();
    if (snapshot.empty) {
      throw new AuthError();
    }

    const keyDoc = snapshot.docs[0];
    const uid = keyDoc.data().uid as string | undefined;
    if (!uid) {
      throw new AuthError();
    }

    keyDoc.ref.update({ last_used_at: new Date() }).catch(() => {});
    return { uid };
  }

  try {
    const decoded = await getServerAuth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    throw new AuthError();
  }
};
