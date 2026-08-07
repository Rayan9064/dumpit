import { NextRequest, NextResponse } from 'next/server';
import { isAuthError, requireAuth, unauthorizedResponse } from '../../_utils/auth';
import { getServerFirestore } from '../../_utils/firebaseAdmin';
import { getPreviewFromUrl } from '../../_utils/linkPreview';
import { checkAuthenticatedRateLimit } from '../../_utils/rateLimit';
import { indexResource } from '../../_utils/resourceIndexer';
import { checkResourceLimit } from '../../_utils/subscription';

// POST /api/extension/capture - Create a resource from the browser extension,
// preserving capture-specific metadata (selected text, canonical URL, source type)
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    // Rate limit: 60 authenticated requests per minute per user
    const authRateLimitResponse = await checkAuthenticatedRateLimit(request, authUser.uid);
    if (authRateLimitResponse) return authRateLimitResponse;

    // Check Free tier resource limit
    const resourceLimitCheck = await checkResourceLimit(authUser.uid);
    if (resourceLimitCheck.isLimited) {
      return NextResponse.json(
        {
          error: `Free tier resource limit (${resourceLimitCheck.max}) reached. Upgrade to Pro for unlimited resource saves.`,
          code: 'UPGRADE_REQUIRED',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      link,
      note,
      tag,
      is_public,
      collection_ids,
      captured_text,
      selected_text,
      canonical_url,
      source_type,
    } = body;

    // Validate required fields
    if (!link && !note && !title && !captured_text) {
      return NextResponse.json(
        { error: 'Missing content: at least a link, title, note, or text is required.' },
        { status: 400 }
      );
    }

    // Validate link format if link is provided
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Link must start with http:// or https://' },
        { status: 400 }
      );
    }

    const db = getServerFirestore();

    // Duplicate resource detection
    if (link) {
      const duplicateQuery = await db.collection('resources')
        .where('user_id', '==', authUser.uid)
        .where('link', '==', link)
        .limit(1)
        .get();

      if (!duplicateQuery.empty) {
        return NextResponse.json(
          { error: 'Duplicate resource: this link has already been saved to your vault.' },
          { status: 409 }
        );
      }
    }

    // If title or tag is missing, attempt to auto-enrich from link
    let enrichedTitle = title || '';
    let enrichedTag = tag || '';
    if (link && (!enrichedTitle || !enrichedTag)) {
      try {
        const metadata = await getPreviewFromUrl(link);
        if (!enrichedTitle && metadata.title) enrichedTitle = metadata.title;
        if (!enrichedTag && metadata.suggestedTag) enrichedTag = metadata.suggestedTag;
      } catch (err) {
        console.warn('Failed to enrich link:', err);
      }
    }
    if (!enrichedTitle) {
      enrichedTitle = link ? 'Untitled Link' : 'Untitled Note';
    }
    if (!enrichedTag) {
      enrichedTag = link ? 'Article' : 'Note';
    }

    const normalizedCollectionIds: string[] = Array.isArray(collection_ids)
      ? collection_ids.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
      : [];

    const resourceRef = db.collection('resources').doc();
    const now = new Date();

    const resourceData = {
      user_id: authUser.uid,
      title: enrichedTitle,
      link: link || null,
      note: note || null,
      tag: enrichedTag || 'Note',
      is_public: is_public ?? false,
      collection_ids: normalizedCollectionIds,
      captured_text: captured_text || null,
      extension_metadata: {
        selected_text: selected_text || null,
        canonical_url: canonical_url || null,
        source_type: source_type || 'chrome_extension',
      },
      index_status: 'pending',
      index_error: null,
      created_at: now,
      updated_at: now,
    };

    let createdCollectionId: string | null = null;
    await db.runTransaction(async (transaction) => {
      normalizedCollectionIds.forEach((collectionId: string) => {
        const membershipRef = db
          .collection('users')
          .doc(authUser.uid)
          .collection('collections')
          .doc(collectionId)
          .collection('resources')
          .doc(resourceRef.id);

        transaction.set(membershipRef, {
          resource_id: resourceRef.id,
          added_at: now,
        });
      });

      transaction.set(resourceRef, resourceData);
    });

    const indexing = await indexResource({ resourceId: resourceRef.id, uid: authUser.uid });

    return NextResponse.json({
      success: true,
      message: 'Resource captured successfully',
      resourceId: resourceRef.id,
      createdCollectionId,
      indexing,
    });

  } catch (error) {
    if (isAuthError(error)) {
      return unauthorizedResponse();
    }

    console.error('Error capturing extension resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
