export interface ExtractedContent {
  text: string;
  title?: string;
}

const MAX_HTML_BYTES = 1_000_000;

const decodeHtmlEntities = (value: string) => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const normalizeWhitespace = (value: string) => value
  .replace(/\s+/g, ' ')
  .trim();

export const extractReadableTextFromHtml = (html: string): ExtractedContent => {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? normalizeWhitespace(decodeHtmlEntities(titleMatch[1])) : undefined;

  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');

  const text = normalizeWhitespace(decodeHtmlEntities(
    withoutNoise
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{[\s\S]*?\}/g, ' ')
  ));

  return { text, title };
};

export const fetchReadableText = async (url: string): Promise<ExtractedContent> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DumpItBot/1.0 (+https://dumpit-three.vercel.app)',
        Accept: 'text/html,text/plain;q=0.9,*/*;q=0.1',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error(`Unsupported content type: ${contentType || 'unknown'}`);
    }

    const body = await response.text();
    const clipped = body.slice(0, MAX_HTML_BYTES);

    if (contentType.includes('text/plain')) {
      return { text: normalizeWhitespace(clipped) };
    }

    return extractReadableTextFromHtml(clipped);
  } finally {
    clearTimeout(timeout);
  }
};

export const chunkText = (text: string, chunkSize = 1400, overlap = 180): string[] => {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const hardEnd = Math.min(start + chunkSize, normalized.length);
    let end = hardEnd;

    if (hardEnd < normalized.length) {
      const sentenceBreak = normalized.lastIndexOf('.', hardEnd);
      const spaceBreak = normalized.lastIndexOf(' ', hardEnd);
      const preferredBreak = sentenceBreak > start + chunkSize * 0.6 ? sentenceBreak + 1 : spaceBreak;
      if (preferredBreak > start + chunkSize * 0.6) {
        end = preferredBreak;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks.slice(0, 24);
};
