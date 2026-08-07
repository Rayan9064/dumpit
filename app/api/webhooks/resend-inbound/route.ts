import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { getServerFirestore } from '../../_utils/firebaseAdmin';
import { indexResource } from '../../_utils/resourceIndexer';
import { checkResourceLimit } from '../../_utils/subscription';

// Resend signs inbound webhooks using the Svix scheme: HMAC-SHA256 over
// "{svix-id}.{svix-timestamp}.{raw body}", base64-encoded, compared against
// one of the space-separated "v1,<sig>" entries in svix-signature.
const verifySvixSignature = (
  rawBody: string,
  svixId: string | null,
  svixTimestamp: string | null,
  svixSignature: string | null,
  secret: string
): boolean => {
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  try {
    const secretBytes = Buffer.from(
      secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret,
      'base64'
    );
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const expectedSignature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

    const providedSignatures = svixSignature
      .split(' ')
      .map((entry) => entry.split(',')[1])
      .filter(Boolean);

    return providedSignatures.some((sig) => {
      try {
        return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(sig));
      } catch {
        return false;
      }
    });
  } catch (err) {
    console.error('Error verifying Resend webhook signature:', err);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;

    if (webhookSecret) {
      const svixId = request.headers.get('svix-id');
      const svixTimestamp = request.headers.get('svix-timestamp');
      const svixSignature = request.headers.get('svix-signature');

      if (!verifySvixSignature(rawBody, svixId, svixTimestamp, svixSignature, webhookSecret)) {
        console.warn('Resend inbound webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Ignore delivery-status events (email.delivered, email.bounced, etc.) — only act on new mail.
    if (payload.type !== 'email.received') {
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    const emailId = payload.data?.email_id;
    if (!emailId) {
      return NextResponse.json({ error: 'Missing email_id' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured — cannot fetch inbound email content');
      return NextResponse.json({ success: true, message: 'Resend not configured' });
    }

    // The webhook payload only carries metadata — fetch the full body separately.
    const resend = new Resend(apiKey);
    const { data: email, error: fetchError } = await resend.emails.receiving.get(emailId);

    if (fetchError || !email) {
      console.error('Failed to fetch inbound email content:', fetchError);
      return NextResponse.json({ success: true, message: 'Could not fetch email content' });
    }

    const fromAddress = email.from;
    const db = getServerFirestore();

    // Match by the sender's registered account email — no per-user token needed,
    // matches the "just forward it" promise on the landing page. Trade-off: a
    // spoofed From header could inject a junk note into someone's private vault
    // (no read/exfiltration risk); revisit with rate-limiting if it's abused.
    const userSnapshot = await db
      .collection('users')
      .where('email', '==', fromAddress)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      console.warn('Inbound email received but sender did not match any registered account:', fromAddress);
      return NextResponse.json({ success: true, message: 'Sender not matched to a user' });
    }

    const uid = userSnapshot.docs[0].id;

    const resourceLimitCheck = await checkResourceLimit(uid);
    if (resourceLimitCheck.isLimited) {
      console.warn(`Inbound email save skipped for ${uid} — free tier resource limit reached`);
      return NextResponse.json({ success: true, message: 'Resource limit reached, save skipped' });
    }

    const bodyText = email.text || (email.html ? email.html.replace(/<[^>]+>/g, ' ').trim() : '') || '';
    const now = new Date();
    const resourceRef = db.collection('resources').doc();

    await resourceRef.set({
      user_id: uid,
      title: email.subject || 'Untitled email',
      link: null,
      note: null,
      tag: 'Note',
      is_public: false,
      collection_ids: [],
      captured_text: bodyText,
      email_metadata: {
        from: fromAddress,
        subject: email.subject || null,
        message_id: email.message_id || null,
      },
      index_status: 'pending',
      index_error: null,
      created_at: now,
      updated_at: now,
    });

    await indexResource({ resourceId: resourceRef.id, uid });

    return NextResponse.json({
      success: true,
      message: 'Resource created from inbound email',
      resourceId: resourceRef.id,
    });
  } catch (error) {
    console.error('Error processing Resend inbound webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
