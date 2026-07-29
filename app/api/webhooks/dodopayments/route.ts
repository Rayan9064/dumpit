import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerFirestore } from '../../_utils/firebaseAdmin';

const verifyWebhookSignature = (
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean => {
  if (!signatureHeader) return false;

  try {
    const hmac = crypto.createHmac('sha256', secret);
    const calculatedSignature = hmac.update(rawBody).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signatureHeader)
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.DODOPAYMENTS_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature =
        request.headers.get('webhook-signature') ||
        request.headers.get('x-dodopayments-signature');

      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.warn('DodoPayments webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType: string = payload.type || payload.event || '';
    const eventData = payload.data || payload;

    const metadata = eventData.metadata || {};
    const userId = metadata.user_id || metadata.uid || metadata.userId;
    const customerEmail =
      eventData.customer?.email || eventData.customer_email || payload.customer_email;
    const subscriptionId =
      eventData.subscription_id || eventData.id || payload.subscription_id || `sub_${Date.now()}`;
    const productId = eventData.product_id || metadata.product_id;

    const db = getServerFirestore();

    // Find target user ID
    let targetUid = userId;
    if (!targetUid && customerEmail) {
      const userSnapshot = await db
        .collection('users')
        .where('email', '==', customerEmail)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        targetUid = userSnapshot.docs[0].id;
      }
    }

    if (!targetUid) {
      console.warn('DodoPayments webhook received but could not resolve user_id:', {
        eventType,
        customerEmail,
        metadata,
      });
      return NextResponse.json(
        { success: true, message: 'Webhook logged but user_id not matched' },
        { status: 200 }
      );
    }

    const now = new Date();
    const isSuccessEvent = [
      'payment.succeeded',
      'subscription.active',
      'subscription.created',
      'subscription.renewed',
      'checkout.session.completed',
    ].includes(eventType);

    const isCancellationEvent = [
      'subscription.cancelled',
      'subscription.expired',
      'subscription.failed',
      'payment.failed',
    ].includes(eventType);

    let newStatus: 'active' | 'cancelled' | 'inactive' = 'inactive';
    if (isSuccessEvent) {
      newStatus = 'active';
    } else if (isCancellationEvent) {
      newStatus = 'cancelled';
    }

    const plan = productId?.includes('api') ? 'api' : 'pro';

    // Update user profile with subscription status
    const userRef = db.collection('users').doc(targetUid);
    await userRef.set(
      {
        subscription: {
          status: newStatus,
          plan: newStatus === 'active' ? plan : 'free',
          subscription_id: subscriptionId,
          customer_email: customerEmail || null,
          product_id: productId || null,
          updated_at: now,
        },
        updated_at: now,
      },
      { merge: true }
    );

    // Save event log to subscriptions collection
    const subLogRef = db.collection('subscriptions').doc(`${subscriptionId}_${Date.now()}`);
    await subLogRef.set({
      subscription_id: subscriptionId,
      user_id: targetUid,
      customer_email: customerEmail || null,
      event_type: eventType,
      status: newStatus,
      plan,
      payload,
      created_at: now,
    });

    console.log(`DodoPayments webhook processed successfully for user ${targetUid}: ${eventType} -> ${newStatus}`);

    return NextResponse.json({
      success: true,
      message: `Webhook processed for user ${targetUid}`,
    });
  } catch (error) {
    console.error('Error processing DodoPayments webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
