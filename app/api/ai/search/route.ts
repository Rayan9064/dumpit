import { NextRequest, NextResponse } from 'next/server';
import { isAuthError, requireAuth, unauthorizedResponse } from '../../_utils/auth';
import { normalizeSearchMode, searchResourceChunks } from '../../_utils/aiSearch';

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { query, mode, limit } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const results = await searchResourceChunks(
      authUser.uid,
      query,
      normalizeSearchMode(mode),
      typeof limit === 'number' ? limit : 8
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error running AI search:', error);
    return NextResponse.json({ error: 'AI search failed' }, { status: 500 });
  }
}
