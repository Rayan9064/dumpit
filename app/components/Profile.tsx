'use client'

import { CheckCircle2, Globe, KeyRound, Loader2, Save, ShieldCheck, Trash2, User, Copy, ExternalLink, Share2 } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authFetch, jsonAuthFetch } from '../lib/authFetch'

interface UserProfile {
  username: string
  email: string
  share_by_default: boolean
  created_at: string
  resource_count?: number
  public_resource_count?: number
}

interface ApiKeySummary {
  id: string
  prefix: string
  label: string | null
  created_at: string
  last_used_at: string | null
}

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [shareByDefault, setShareByDefault] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [keyCopied, setKeyCopied] = useState(false)

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  useEffect(() => {
    if (user) {
      loadProfile()
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

  useEffect(() => {
    if (profile?.username) {
      const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://dumpit-three.vercel.app')
      setShareUrl(`${origin}/u/${profile.username.toLowerCase()}`)
    } else {
      setShareUrl('')
    }
  }, [profile])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)

    try {
      const response = await authFetch(user, '/api/user-profile')
      if (!response.ok) throw new Error('Failed to load profile')
      const data = await response.json()
      setProfile(data.profile)
      setUsername(data.profile.username || '')
      setShareByDefault(data.profile.share_by_default || false)
    } catch (err) {
      console.error('Error loading profile:', err)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage(null)

    try {
      const response = await jsonAuthFetch(user, '/api/user-profile', {
        method: 'PUT',
        body: JSON.stringify({
          username,
          share_by_default: shareByDefault,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' })
      loadProfile()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="app-chip mb-3">Workspace settings</span>
        <h1 className="text-3xl font-bold tracking-normal text-zinc-950 dark:text-white">Profile and defaults</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Control how new resources enter your knowledge vault and keep your public identity clear.
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

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="app-panel p-5">
          <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <User className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-zinc-950 dark:text-white">{profile?.username || 'User'}</h2>
              <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{profile?.email}</p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label htmlFor="profile-username" className="app-label">Username</label>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="app-input mt-2"
              />
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    Share new resources by default
                  </div>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    Public resources can appear in Shared Dump and shared AI search. Private resources stay scoped to your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShareByDefault((value) => !value)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    shareByDefault ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                  aria-pressed={shareByDefault}
                  aria-label="Toggle share by default"
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      shareByDefault ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save changes
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="app-panel p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Access model
            </div>
            <div className="space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <p>Your private links are retrieved only for your signed-in account.</p>
              <p>Shared resources are opt-in and can be cited by other users in shared search modes.</p>
            </div>
          </section>

          {profile?.username && (
            <section className="app-panel p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white">
                <Share2 className="h-4 w-4 text-blue-600" />
                Public Library Link
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                Anyone can view your publicly shared resources by visiting your personal link.
              </p>
              <div className="app-muted-panel p-2 mb-3 truncate text-xs text-zinc-600 dark:text-zinc-350 select-all font-mono">
                {shareUrl || `.../u/${profile.username.toLowerCase()}`}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={`/u/${profile.username.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-750 text-xs font-bold text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Library
                </a>
              </div>
            </section>
          )}

          <section className="app-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white">
              <KeyRound className="h-4 w-4 text-blue-600" />
              API Keys
            </div>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              Use an API key for REST API access or the DumpIt MCP server. Keys are shown once — copy them somewhere safe.
            </p>

            {newRawKey && (
              <div className="app-muted-panel mb-3 p-3">
                <p className="mb-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">New key generated — copy it now:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-white px-2 py-1.5 text-xs dark:bg-zinc-900">{newRawKey}</code>
                  <button
                    onClick={handleCopyKey}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                {keyCopied && <p className="mt-1 text-xs text-emerald-600">Copied!</p>}
              </div>
            )}

            {loadingKeys ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : apiKeys.length > 0 ? (
              <ul className="mb-3 space-y-2">
                {apiKeys.map((key) => (
                  <li key={key.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-xs dark:border-zinc-800">
                    <code className="text-zinc-600 dark:text-zinc-300">{key.prefix}</code>
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      aria-label="Revoke key"
                      className="text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-xs text-zinc-400 dark:text-zinc-500">No API keys yet.</p>
            )}

            <button
              onClick={handleGenerateKey}
              disabled={generatingKey || apiKeys.length >= 5}
              className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
              Generate new key
            </button>
          </section>

          {profile && (
            <section className="app-panel p-4">
              <h2 className="mb-4 text-sm font-bold text-zinc-950 dark:text-white">Vault stats</h2>
              <div className="grid gap-3">
                <StatCard icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />} value={profile.resource_count || 0} label="Total resources" />
                <StatCard icon={<Globe className="h-5 w-5 text-emerald-600" />} value={profile.public_resource_count || 0} label="Public resources" />
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="app-muted-panel flex items-center justify-between p-4">
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900">
        {icon}
      </div>
    </div>
  )
}
