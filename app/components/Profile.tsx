'use client'

import { CheckCircle2, Globe, Loader2, Save, ShieldCheck, User } from 'lucide-react'
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

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [shareByDefault, setShareByDefault] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

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
        <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white">Profile and defaults</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
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
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <User className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-950 dark:text-white">{profile?.username || 'User'}</h2>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
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

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    Share new resources by default
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Public resources can appear in Shared Dump and shared AI search. Private resources stay scoped to your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShareByDefault((value) => !value)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    shareByDefault ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
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
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Access model
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <p>Your private links are retrieved only for your signed-in account.</p>
              <p>Shared resources are opt-in and can be cited by other users in shared search modes.</p>
            </div>
          </section>

          {profile && (
            <section className="app-panel p-4">
              <h2 className="mb-4 text-sm font-bold text-slate-950 dark:text-white">Vault stats</h2>
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
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-900">
        {icon}
      </div>
    </div>
  )
}
