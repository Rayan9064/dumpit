import { getServerFirestore } from './firebaseAdmin';

export interface UserSubscriptionInfo {
  isPro: boolean;
  plan: 'free' | 'pro' | 'api';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  subscriptionId?: string;
}

export const getUserSubscription = async (uid: string): Promise<UserSubscriptionInfo> => {
  try {
    const db = getServerFirestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return { isPro: false, plan: 'free', status: 'inactive' };
    }

    const userData = userDoc.data();
    const sub = userData?.subscription;

    if (sub && (sub.status === 'active' || sub.status === 'succeeded' || sub.status === 'trialing')) {
      return {
        isPro: true,
        plan: sub.plan || 'pro',
        status: 'active',
        subscriptionId: sub.subscription_id,
      };
    }

    return {
      isPro: false,
      plan: 'free',
      status: sub?.status || 'inactive',
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return { isPro: false, plan: 'free', status: 'inactive' };
  }
};

export const checkResourceLimit = async (
  uid: string
): Promise<{ isLimited: boolean; count: number; max: number }> => {
  const subInfo = await getUserSubscription(uid);

  // Pro and API tier users have unlimited resources
  if (subInfo.isPro) {
    return { isLimited: false, count: 0, max: Infinity };
  }

  const FREE_RESOURCE_LIMIT = 50;
  const db = getServerFirestore();
  const resourcesSnapshot = await db
    .collection('resources')
    .where('user_id', '==', uid)
    .select()
    .get();

  const count = resourcesSnapshot.size;

  return {
    isLimited: count >= FREE_RESOURCE_LIMIT,
    count,
    max: FREE_RESOURCE_LIMIT,
  };
};

const getYearMonthKey = (): string => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const checkAiQueryLimit = async (
  uid: string
): Promise<{ isLimited: boolean; count: number; max: number }> => {
  const subInfo = await getUserSubscription(uid);

  // Pro users get 300 queries/month, API plan gets 500
  const max = subInfo.isPro ? (subInfo.plan === 'api' ? 500 : 300) : 15;
  const db = getServerFirestore();
  const ymKey = getYearMonthKey();

  const usageDoc = await db
    .collection('users')
    .doc(uid)
    .collection('ai_usage')
    .doc(ymKey)
    .get();

  const count = usageDoc.exists ? usageDoc.data()?.count || 0 : 0;

  return {
    isLimited: count >= max,
    count,
    max,
  };
};

export const incrementAiQueryCount = async (uid: string): Promise<void> => {
  try {
    const db = getServerFirestore();
    const ymKey = getYearMonthKey();
    const usageRef = db.collection('users').doc(uid).collection('ai_usage').doc(ymKey);

    const doc = await usageRef.get();
    if (doc.exists) {
      await usageRef.update({
        count: (doc.data()?.count || 0) + 1,
        updated_at: new Date(),
      });
    } else {
      await usageRef.set({
        count: 1,
        year_month: ymKey,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  } catch (error) {
    console.error('Error incrementing AI query count:', error);
  }
};
