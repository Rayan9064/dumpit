export interface PageMetadata {
  title: string;
  url: string;
  canonicalUrl?: string;
  description?: string;
  favicon?: string;
  selectedText?: string;
  capturedText?: string;
}

export function extractPageMetadata(): PageMetadata {
  const title = document.title || window.location.hostname;
  const url = window.location.href;

  // Find canonical URL
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonicalEl ? canonicalEl.getAttribute('href') || undefined : undefined;

  // Find description meta tag
  const descEl = document.querySelector('meta[name="description"]') || 
                 document.querySelector('meta[property="og:description"]');
  const description = descEl ? descEl.getAttribute('content') || undefined : undefined;

  // Find favicon
  const faviconEl = document.querySelector('link[rel="icon"]') || 
                    document.querySelector('link[rel="shortcut icon"]');
  let favicon = faviconEl ? faviconEl.getAttribute('href') || undefined : undefined;
  if (favicon && !favicon.startsWith('http')) {
    // Resolve relative path
    try {
      favicon = new URL(favicon, window.location.href).href;
    } catch (_) {}
  }

  // Get current selection
  const selectedText = window.getSelection()?.toString().trim() || undefined;

  // Extract readable text from DOM in a clean way
  const capturedText = extractReadableText();

  return {
    title,
    url,
    canonicalUrl,
    description,
    favicon,
    selectedText,
    capturedText
  };
}

function extractReadableText(): string {
  // We want to avoid scripts, styles, navs, footers, etc.
  const selectorsToExclude = [
    'script', 'style', 'noscript', 'iframe', 'svg', 
    'nav', 'footer', 'header', '.footer', '.header', '.nav', 
    '#footer', '#header', '#nav', '.sidebar', '#sidebar',
    'input', 'textarea', 'button', 'select'
  ];

  // Clone document body so we can mutate it safely
  if (!document.body) return '';
  const bodyClone = document.body.cloneNode(true) as HTMLElement;

  // Remove unwanted elements
  selectorsToExclude.forEach(selector => {
    bodyClone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Extract text contents from meaningful block elements
  const blockElements = bodyClone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, article, section, div');
  const lines: string[] = [];
  const visited = new Set<Node>();

  blockElements.forEach(el => {
    // Avoid double-counting text if parent and child elements are both blocks
    // We only take the text if it contains direct text nodes or we process leaf nodes
    let hasDirectText = false;
    for (let i = 0; i < el.childNodes.length; i++) {
      const node = el.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        hasDirectText = true;
        break;
      }
    }

    if (hasDirectText && !visited.has(el)) {
      const txt = el.textContent?.trim().replace(/\s+/g, ' ');
      if (txt && txt.length > 10) {
        lines.push(txt);
        // Mark all ancestors as visited so we don't grab them in parent divs
        let parent: Node | null = el;
        while (parent) {
          visited.add(parent);
          parent = parent.parentNode;
        }
      }
    }
  });

  // Combine into a single text block
  let combined = lines.join('\n\n');

  // Fallback if structured block extraction yielded nothing
  if (!combined.trim()) {
    combined = bodyClone.textContent?.trim().replace(/\s+/g, ' ') || '';
  }

  // Cap length to ~15,000 characters to keep payload sizes reasonable
  const MAX_CHARACTERS = 15000;
  if (combined.length > MAX_CHARACTERS) {
    combined = combined.slice(0, MAX_CHARACTERS) + '\n\n[...Text content truncated for length...]';
  }

  return combined;
}
