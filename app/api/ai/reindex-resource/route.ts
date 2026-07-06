import { NextRequest, NextResponse } from 'next/server';
import { isAuthError, requireAuth, unauthorizedResponse } from '../../_utils/auth';
import { indexResource } from '../../_utils/resourceIndexer';

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { resourceId } = await request.json();

    if (!resourceId || typeof resourceId !== 'string') {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }

    const result = await indexResource({ resourceId, uid: authUser.uid });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error reindexing resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
