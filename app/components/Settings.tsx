'use client'

import { Copy, KeyRound, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authFetch, jsonAuthFetch } from '../lib/authFetch'

interface ApiKeySummary {
  id: string
  prefix: string
  label: string | null
  created_at: string
  last_used_at: string | null
}

export function Settings() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [keyCopied, setKeyCopied] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      loadApiKeys()
    }
  }, [user])

  const loadApiKeys = async () => {
    if (!user) return
    setLoadingKeys(true)
    try {
      const response = await authFetch(user, '/api/settings/api-keys')
      if (!response.ok) throw new Error('Failed to load API keys')
      const data = await response.json()
      setApiKeys(data.keys || [])
    } catch (err) {
      console.error('Error loading API keys:', err)
    } finally {
      setLoadingKeys(false)
    }
  }

  const handleGenerateKey = async () => {
    if (!user) return
    setGeneratingKey(true)
    setNewRawKey(null)
    setMessage(null)
    try {
      const response = await jsonAuthFetch(user, '/api/settings/api-keys', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate API key')
      setNewRawKey(data.key)
      loadApiKeys()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to generate API key' })
    } finally {
      setGeneratingKey(false)
    }
  }

  const handleRevokeKey = async (id: string) => {
    if (!user) return
    try {
      const response = await authFetch(user, `/api/settings/api-keys?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to revoke API key')
      setApiKeys((keys) => keys.filter((k) => k.id !== id))
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to revoke API key' })
    }
  }

  const handleCopyKey = async () => {
    if (!newRawKey) return
    try {
      await navigator.clipboard.writeText(newRawKey)
      setKeyCopied(true)
      setTimeout(() => setKeyCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy API key:', err)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="app-chip mb-3">Developer</span>
        <h1 className="text-3xl font-bold tracking-normal text-zinc-950 dark:text-white">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Manage API keys for REST API access and the DumpIt MCP server.
        </p>
      </header>

      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="app-panel max-w-2xl p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white">
          <KeyRound className="h-4 w-4 text-blue-600" />
          API Keys
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Use an API key for REST API access or the DumpIt MCP server. Keys are shown once — copy them somewhere safe.
        </p>

        {newRawKey && (
          <div className="app-muted-panel mb-4 p-4">
            <p className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">New key generated — copy it now:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-3 py-2 text-sm dark:bg-zinc-900">{newRawKey}</code>
              <button
                onClick={handleCopyKey}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {keyCopied && <p className="mt-1.5 text-xs text-emerald-600">Copied!</p>}
          </div>
        )}

        {loadingKeys ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
        ) : apiKeys.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {apiKeys.map((key) => (
              <li key={key.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
                <code className="text-zinc-600 dark:text-zinc-300">{key.prefix}</code>
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  aria-label="Revoke key"
                  className="text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-zinc-400 dark:text-zinc-500">No API keys yet.</p>
        )}

        <button
          onClick={handleGenerateKey}
          disabled={generatingKey || apiKeys.length >= 5}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-sm font-bold text-zinc-700 dark:text-zinc-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          Generate new key
        </button>
      </section>
    </div>
  )
}
