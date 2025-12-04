import { getLinkPreview } from 'link-preview-js';

interface LinkPreviewResult {
  title?: string;
  description?: string;
  suggestedTag?: string;
  favicon?: string;
}

async function fallbackExtractMetadata(url: string): Promise<Partial<LinkPreviewResult>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) return {};
    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : undefined,
      description: descMatch ? descMatch[1].trim() : undefined,
      favicon: ogImageMatch ? ogImageMatch[1] : undefined,
    };
  } catch (error) {
    console.error('fallbackExtractMetadata error:', error);
    return {};
  }
}

export async function getPreviewFromUrl(url: string): Promise<LinkPreviewResult> {
  try {
    const data: any = await getLinkPreview(url, { 
      imagesPropertyType: 'og',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Normalise fields
    const title = data.title || data.siteName || undefined;
    const description = data.description || undefined;
    const favicon = Array.isArray(data.favicons) && data.favicons.length > 0 ? data.favicons[0] : undefined;
    const images = Array.isArray(data.images) ? data.images : [];

    return {
      title: title || undefined,
      description,
      suggestedTag: data.siteName || (description ? 'Article' : undefined),
      favicon: favicon || images[0] || undefined,
    };
  } catch (err) {
    console.warn('getLinkPreview error (falling back):', err);
    const fallback = await fallbackExtractMetadata(url);
    return {
      title: fallback.title,
      description: fallback.description,
      suggestedTag: fallback.title ? 'Article' : undefined,
      favicon: fallback.favicon,
    };
  }
}

export default getPreviewFromUrl;
