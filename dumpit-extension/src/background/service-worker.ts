// DumpIt Background Service Worker

// Register context menus on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save_page',
    title: 'Save page to DumpIt',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'save_link',
    title: 'Save link to DumpIt',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'save_selection',
    title: 'Save selection to DumpIt',
    contexts: ['selection']
  });
});

// Configure side panel behavior
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  const tabId = tab.id;
  let pageTitle = tab.title || '';
  let url = tab.url || '';
  let note = '';
  let selectedText = '';

  if (info.menuItemId === 'save_page') {
    url = info.pageUrl || url;
  } else if (info.menuItemId === 'save_link') {
    url = info.linkUrl || url;
    pageTitle = `Saved Link: ${url}`;
  } else if (info.menuItemId === 'save_selection') {
    url = info.pageUrl || url;
    selectedText = info.selectionText || '';
    note = `"${selectedText}"`;
  }

  // Open side panel
  try {
    await chrome.sidePanel.open({ tabId });
  } catch (err) {
    console.error('Failed to open side panel:', err);
  }

  // Wait a moment for side panel to load and register listeners, then send data
  setTimeout(() => {
    chrome.runtime.sendMessage({
      action: 'PREFILL_CAPTURE',
      data: {
        title: pageTitle,
        link: url,
        note: note,
        selectedText: selectedText
      }
    }).catch(() => {
      // Ignore error if side panel is not fully ready/listening yet
    });
  }, 800);
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'SAVE_COMPLETE') {
    console.log('Save completed successfully:', message.data);
    sendResponse({ received: true });
  }
  return true;
});
