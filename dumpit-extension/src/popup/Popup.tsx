import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import LoginView from '../components/LoginView';
import { saveResource, fetchCollections, Collection } from '../lib/api';
import { getApiBaseUrl, setApiBaseUrl, getSavedCollections, setSavedCollections } from '../lib/storage';
import { 
  Globe, 
  Lock, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  LogOut, 
  Settings, 
  Columns, 
  ExternalLink 
} from 'lucide-react';

const TAGS = [
  'Article',
  'Tutorial',
  'Video',
  'Tool',
  'Documentation',
  'Course',
  'Book',
  'Podcast',
  'Newsletter',
  'Other',
];

export default function Popup() {
  const [user, setUser] = useState<{ email?: string; uid?: string } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('Article');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('none');

  // Extension/App states
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Settings states
  const [showSettings, setShowSettings] = useState(false);
  const [apiBaseUrl, setApiBaseUrlState] = useState('');

  function parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  const handleTokenLoaded = async (t: string) => {
    setAuthToken(t);
    const parsed = parseJwt(t);
    if (parsed) {
      setUser({ email: parsed.email, uid: parsed.sub || parsed.user_id });
    } else {
      setUser({ email: 'Vault User' });
    }

    // Load configs
    const cached = await getSavedCollections();
    setCollections(cached);
    const savedUrl = await getApiBaseUrl();
    setApiBaseUrlState(savedUrl);

    setAuthLoading(false);
    loadCollections(t);
    extractCurrentPage();
  };

  useEffect(() => {
    // Check if token exists in storage
    chrome.storage.local.get('token', (data) => {
      if (data.token) {
        handleTokenLoaded(data.token);
      } else {
        // Double-check firebase auth local state just in case, but prioritize chrome.storage.local token
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            const t = await currentUser.getIdToken();
            await chrome.storage.local.set({ token: t });
            handleTokenLoaded(t);
          } else {
            setUser(null);
            setAuthToken(null);
            setAuthLoading(false);
          }
        });
        return () => unsubscribe();
      }
    });

    // Listen for storage changes (e.g. from background, sidepanel or content-script event sync)
    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.token) {
        const val = changes.token.newValue;
        if (val) {
          handleTokenLoaded(val);
        } else {
          setUser(null);
          setAuthToken(null);
        }
      }
    };
    chrome.storage.onChanged.addListener(storageListener);
    return () => chrome.storage.onChanged.removeListener(storageListener);
  }, []);

  const loadCollections = async (t: string) => {
    setLoadingCollections(true);
    try {
      const fetched = await fetchCollections(t);
      setCollections(fetched);
      await setSavedCollections(fetched.map(c => ({ id: c.id, name: c.name })));
    } catch (e) {
      console.error('Failed to load collections', e);
    } finally {
      setLoadingCollections(false);
    }
  };

  const extractCurrentPage = async () => {
    setExtracting(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setExtracting(false);
        return;
      }

      setLink(tab.url || '');
      setTitle(tab.title || '');

      // Try sending a message to the content script
      chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_DETAILS' }, (response) => {
        setExtracting(false);
        if (chrome.runtime.lastError) {
          console.warn('Content script unavailable:', chrome.runtime.lastError.message);
          return;
        }
        if (response && response.success && response.data) {
          setTitle(response.data.title || tab.title || '');
          setLink(response.data.url || tab.url || '');
          if (response.data.selectedText) {
            setNote(`"${response.data.selectedText}"`);
          } else if (response.data.description) {
            setNote(response.data.description);
          }
        }
      });
    } catch (e) {
      console.error('Extraction failed', e);
      setExtracting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    setSaving(true);
    setStatus({ type: null, message: '' });

    try {
      const payload = {
        title,
        link,
        note,
        tag,
        is_public: isPublic,
        collection_ids: selectedCollectionId !== 'none' ? [selectedCollectionId] : []
      };

      const res = await saveResource(authToken, payload);
      if (res.success) {
        setStatus({ type: 'success', message: 'Resource saved to DumpIt!' });
        setNote('');
      } else {
        if (res.error?.includes('401') || res.error?.includes('Unauthorized')) {
          // Token expired, clear it
          await chrome.storage.local.remove('token');
        }
        setStatus({ type: 'error', message: res.error || 'Failed to save resource.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await chrome.storage.local.remove('token');
    await signOut(auth);
    setUser(null);
    setAuthToken(null);
  };

  const handleSaveSettings = async () => {
    await setApiBaseUrl(apiBaseUrl);
    setShowSettings(false);
    setStatus({ type: 'success', message: 'API settings updated!' });
    if (authToken) {
      loadCollections(authToken);
    }
  };

  const openSidePanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close(); // Close popup
    }
  };

  if (authLoading) {
    return (
      <div className="w-[380px] h-[450px] flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-stone-600 dark:text-stone-300" />
          <span className="text-sm text-stone-500">Connecting to Vault...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-[380px] min-h-[450px] bg-stone-50 dark:bg-stone-900 p-4 flex items-center justify-center">
        <LoginView onSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="w-[380px] min-h-[500px] bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors duration-250">
      {/* Header */}
      <header className="px-4 py-3 bg-white dark:bg-stone-950 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-800 dark:bg-stone-800 flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
          <span className="font-semibold text-sm tracking-wide">DumpIt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={openSidePanel}
            title="Open Sidepanel"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Columns className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {showSettings ? (
          <div className="space-y-4 bg-white dark:bg-stone-950 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800 animate-fadeIn">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2">Extension Settings</h2>
            <div>
              <label className="label-text">Backend URL</label>
              <input
                type="url"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrlState(e.target.value)}
                placeholder="http://localhost:3000"
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="btn-primary"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Status alerts */}
            {status.type && (
              <div className={`p-3 rounded-lg text-xs border flex items-start gap-2.5 ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/40 text-red-800 dark:text-red-300'}`}>
                {status.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>{status.message}</span>
              </div>
            )}

            <div>
              <label className="label-text">Link</label>
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text flex items-center justify-between">
                <span>Title</span>
                {extracting && <Loader2 className="h-3 w-3 animate-spin text-stone-500" />}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Loading active page title..."
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Note / Context Excerpt</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add selected text or your own context..."
                className="input-field resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Tag</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="input-field"
                >
                  {TAGS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Collection</label>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  disabled={loadingCollections}
                  className="input-field"
                >
                  <option value="none">No collection</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label-text">Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${!isPublic ? 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white' : 'bg-transparent border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${isPublic ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200' : 'bg-transparent border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Public
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full mt-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save to DumpIt</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 py-2 bg-white dark:bg-stone-950 border-t border-stone-200/60 dark:border-stone-800 text-center flex items-center justify-center">
        <a
          href={`${apiBaseUrl}/dashboard`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-700 dark:text-stone-400 hover:underline flex items-center gap-1.5 hover:text-brand-900 dark:hover:text-stone-200"
        >
          <span>Open Dashboard</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </footer>
    </div>
  );
}
