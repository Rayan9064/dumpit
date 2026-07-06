import { NextRequest, NextResponse } from 'next/server';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getServerAuth } from './firebaseAdmin';

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
