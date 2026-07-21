import { NextRequest, NextResponse } from 'next/server';
import { isAuthError, requireAuth, unauthorizedResponse } from '../../_utils/auth';
import { getServerFirestore } from '../../_utils/firebaseAdmin';
import { extractTextFromPdf } from '../../_utils/pdfExtractor';
import { checkAuthenticatedRateLimit } from '../../_utils/rateLimit';
import { indexResource } from '../../_utils/resourceIndexer';

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    // Rate limit: 60 authenticated requests per minute per user
    const authRateLimitResponse = await checkAuthenticatedRateLimit(request, authUser.uid);
    if (authRateLimitResponse) return authRateLimitResponse;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customTitle = (formData.get('title') as string) || '';
    const note = (formData.get('note') as string) || '';
    const isPublic = formData.get('is_public') === 'true';
    const collectionIdsRaw = formData.get('collection_ids') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file uploaded.' },
        { status: 400 }
      );
    }

    // Validate size (10MB max = 10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    // Validate mime type / extension
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Uploaded file must be a PDF document.' },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    const pdfData = await extractTextFromPdf(buffer);
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this PDF (it may be a scanned image-only PDF).' },
        { status: 422 }
      );
    }

    const title = customTitle.trim() || file.name.replace(/\.pdf$/i, '');
    let collection_ids: string[] = [];
    if (collectionIdsRaw) {
      try {
        collection_ids = JSON.parse(collectionIdsRaw);
      } catch {
        collection_ids = [];
      }
    }

    const db = getServerFirestore();
    const now = new Date();
    const resourceRef = db.collection('resources').doc();

    const resourceData = {
      user_id: authUser.uid,
      title,
      link: null,
      note: note || null,
      tag: 'PDF',
      is_public: isPublic,
      collection_ids,
      captured_text: pdfData.text,
      pdf_metadata: {
        file_name: file.name,
        file_size: file.size,
        num_pages: pdfData.numpages,
      },
      index_status: 'pending',
      index_error: null,
      created_at: now,
      updated_at: now,
    };

    await resourceRef.set(resourceData);

    // Trigger AI indexing in background
    indexResource({ resourceId: resourceRef.id, uid: authUser.uid }).catch((err) => {
      console.error('Failed to index PDF resource:', err);
    });

    return NextResponse.json({
      success: true,
      resource: {
        id: resourceRef.id,
        ...resourceData,
      },
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error processing PDF upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error processing PDF' },
      { status: 500 }
    );
  }
}
