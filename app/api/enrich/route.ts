import { NextRequest, NextResponse } from 'next/server'
import { getPreviewFromUrl } from '../_utils/linkPreview';

interface EnrichRequest {
  url: string
}

interface EnrichResponse {
  title?: string
  description?: string
  suggestedTag?: string
  favicon?: string
  error?: string
}

// The real extraction logic now lives in app/api/_utils/linkPreview.ts

/**
 * POST /api/enrich
 * Server-side metadata extraction from a URL.
 * Request: { url: string }
 * Response: { title?, description?, suggestedTag?, favicon?, error? }
 */
export async function POST(request: NextRequest): Promise<NextResponse<EnrichResponse>> {
  try {
    const body: EnrichRequest = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'url is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Extract metadata using link-preview-js with fallback
    const metadata = await getPreviewFromUrl(url)

    // TODO: Integrate Gemini API for AI-generated suggestions if needed
    // const geminiKey = process.env.GEMINI_API_KEY
    // if (geminiKey && metadata.title) {
    //   const suggestedTag = await callGeminiForTag(url, metadata.title, geminiKey)
    //   metadata.suggestedTag = suggestedTag
    // }

    return NextResponse.json(
      {
        title: metadata.title || 'Untitled',
        description: metadata.description || 'No description available',
        suggestedTag: metadata.suggestedTag || 'Article',
        favicon: metadata.favicon,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in /api/enrich:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Optional: Server-side Gemini wrapper (currently stubbed)
 * Uncomment and implement when ready to enable AI tagging
 */
// async function callGeminiForTag(
//   url: string,
//   title: string,
//   apiKey: string
// ): Promise<string> {
//   try {
//     const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-pro:generateContent', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-goog-api-key': apiKey,
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: `Given this webpage title: "${title}" from URL: "${url}", suggest a single relevant tag category (max 2 words). Return only the tag.`,
//               },
//             ],
//           },
//         ],
//       }),
//     })

//     if (!response.ok) {
//       return 'Article'
//     }

//     const data = await response.json()
//     const suggestedTag = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Article'
//     return suggestedTag.trim()
//   } catch (error) {
//     console.error('Error calling Gemini:', error)
//     return 'Article'
//   }
// }
