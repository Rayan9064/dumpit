import { MetadataRoute } from 'next'
import { getServerFirestore } from './api/_utils/firebaseAdmin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dumpit-three.vercel.app'

  let userUrls: MetadataRoute.Sitemap = []
  try {
    const db = getServerFirestore()
    const usersSnapshot = await db.collection('users').get()
    
    userUrls = usersSnapshot.docs
      .map((doc) => {
        const data = doc.data()
        const username = data.username
        if (!username) return null
        
        let lastModDate = new Date()
        if (data.updated_at) {
          if (typeof data.updated_at.toDate === 'function') {
            lastModDate = data.updated_at.toDate()
          } else {
            lastModDate = new Date(data.updated_at)
          }
        }
        
        return {
          url: `${baseUrl}/u/${username}`,
          lastModified: lastModDate,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }
      })
      .filter((url): url is Exclude<typeof url, null> => url !== null)
  } catch (error) {
    console.error('Error generating sitemap dynamic URLs:', error)
  }

  const staticUrls = ['', '/privacy', '/terms'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.3,
  }))

  return [...staticUrls, ...userUrls]
}
