'use client'

import { Bot, ExternalLink, Info, Loader2, Search, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { jsonAuthFetch } from '../lib/authFetch'

type SearchMode = 'all' | 'mine' | 'shared'

interface Source {
  chunkId: string
  resourceId: string
  title: string
  url: string
  snippet: string
  tag: string
  isPublic: boolean
  ownerId: string
  distance: number | null
}

const MODES: Array<{ id: SearchMode; label: string; description: string }> = [
  { id: 'all', label: 'All', description: 'Private + shared' },
  { id: 'mine', label: 'My Dump', description: 'Only your vault' },
  { id: 'shared', label: 'Shared', description: 'Public sources' },
]

const suggestions = [
  'What should I read before building RAG?',
  'Find my saved Firebase authentication resources',
  'Summarize the best public resources about AI citations',
]

export function AskDumpit() {
  const { user } = useAuth()
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<SearchMode>('all')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const askQuestion = async (value: string) => {
    if (!user || !value.trim()) return

    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])

    try {
      const response = await jsonAuthFetch(user, '/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({
          question: value.trim(),
          mode,
          limit: 8,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Ask DumpIt failed')
      }

      setAnswer(data.answer || '')
      setSources(data.sources || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ask DumpIt failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await askQuestion(question)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="app-panel overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  <Bot className="h-4 w-4" />
                  AI Search
                </div>
                <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
                  Ask your saved internet.
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  DumpIt answers from indexed resources and returns source cards so you can verify the underlying links.
                </p>
              </div>
              <span className="app-chip app-chip-ai">Cited RAG</span>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`rounded-lg border px-3 py-3 text-left transition-colors app-focus ${
                    mode === item.id
                      ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="mt-1 text-xs opacity-75">{item.description}</div>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <label htmlFor="ask-dumpit" className="sr-only">Ask DumpIt</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="ask-dumpit"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask about saved links, tutorials, tools, or shared resources..."
                    className="app-input pl-10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="inline-flex min-w-[112px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  Ask
                </button>
              </div>
            </form>

            {!answer && !loading && !error && (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuestion(item)
                      askQuestion(item)
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="app-muted-panel p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <Info className="h-4 w-4 text-blue-600" />
            How answers work
          </div>
          <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>DumpIt retrieves indexed chunks from resources you can access.</p>
            <p>Private resources only appear for their owner. Shared mode uses public resources from other users.</p>
            <p>Use source cards to open the original link and verify the answer.</p>
          </div>
        </aside>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {(answer || loading) && (
        <section className="app-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Answer</h2>
            {sources.length > 0 && <span className="app-chip">{sources.length} sources</span>}
          </div>
          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Reading indexed resources...
              </div>
              <div className="h-3 w-full max-w-2xl rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-2/3 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-700 dark:text-slate-200">{answer}</p>
          )}
        </section>
      )}

      {sources.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Sources</h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Open links to verify context</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sources.map((source, index) => (
              <article key={source.chunkId} className="app-panel p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">[{index + 1}]</span>
                  <span className={`app-chip ${source.isPublic ? 'app-chip-success' : ''}`}>
                    {source.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <h3 className="line-clamp-2 font-bold text-slate-950 dark:text-white">{source.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{source.snippet}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="app-chip">{source.tag}</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                  >
                    Open
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!answer && !loading && !error && (
        <div className="app-panel p-8 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">No question yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Ask about anything you have saved. If a link is not indexed yet, re-save or reindex it from the resource workflow.
          </p>
        </div>
      )}
    </div>
  )
}
