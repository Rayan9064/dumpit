import { extractPageMetadata } from '../lib/extract';

// Listen for messages from the popup, side panel, or background worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'GET_PAGE_DETAILS') {
    try {
      const details = extractPageMetadata();
      sendResponse({ success: true, data: details });
    } catch (err: any) {
      sendResponse({ success: false, error: err.message || 'Failed to extract content' });
    }
  }
  return true; // Keep message channel open for async response
});
// Listen for custom event from DumpIt webpage
document.addEventListener('DUMPIT_EXTENSION_AUTH', (e: any) => {
  const token = e.detail?.token;
  if (!token) return;

  const currentOrigin = window.location.origin;
  
  // Verify that the origin is either localhost:3000 or matches the configured API URL
  chrome.storage.local.get('apiBaseUrl', (data) => {
    const configuredOrigin = data.apiBaseUrl ? new URL(data.apiBaseUrl).origin : 'http://localhost:3000';
    if (currentOrigin === 'http://localhost:3000' || currentOrigin === configuredOrigin) {
      chrome.storage.local.set({ token });
      console.log('[DumpIt Extension] Successfully synchronized Auth token from website!');
    } else {
      console.warn('[DumpIt Extension] Blocked auth sync from untrusted origin:', currentOrigin);
    }
  });
});
