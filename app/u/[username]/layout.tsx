import { Metadata } from 'next';
import React from 'react';
import { getServerFirestore } from '../../api/_utils/firebaseAdmin';


export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const username = params.username?.toLowerCase() || '';
  try {
    const db = getServerFirestore();
    const querySnapshot = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return {
        title: 'Profile not found · DumpIt',
        description: 'This user profile does not exist on DumpIt.',
      };
    }

    const userData = querySnapshot.docs[0].data();
    const displayName = userData.display_name || userData.email?.split('@')[0] || username;

    return {
      title: `${displayName} (@${username}) · DumpIt`,
      description: `Browse ${displayName}'s curated vault of resources, notes, and links on DumpIt.`,
      openGraph: {
        title: `${displayName} (@${username}) · DumpIt`,
        description: `Browse ${displayName}'s curated vault of resources, notes, and links on DumpIt.`,
        type: 'profile',
        username: username,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} (@${username}) · DumpIt`,
        description: `Browse ${displayName}'s curated vault of resources, notes, and links on DumpIt.`,
      },
    };
  } catch (error) {
    console.error('Error generating profile metadata:', error);
    return {
      title: `@${username} · DumpIt`,
      description: `Curated public library on DumpIt.`,
    };
  }
}

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
