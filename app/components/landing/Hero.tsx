'use client'

import { ArrowRight, Bot, CheckCircle2, Chrome, Code2, FileText, Link2, StickyNote, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

const trustItems = [
  { icon: Link2, label: 'Links & PDFs' },
  { icon: Bot, label: 'AI search' },
  { icon: Code2, label: 'REST API' },
  { icon: FileText, label: 'Claude MCP' },
  { icon: Chrome, label: 'Browser extension' },
]

const Hero = () => {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-stone-50 dark:border-slate-800 dark:bg-slate-950">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-60 dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)]" />
      {/* Radial glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
        {/* Founding member badge */}
        <div className="mb-6 flex justify-center">
          <a
            href="#pricing"
            className="group inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
          >
            <Zap className="h-3.5 w-3.5" />
            Founding members get 50% off Pro — forever
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            Your saved content,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
              finally useful.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            DumpIt indexes everything you save — links, notes, PDFs — and lets you ask questions across it all. Via web, browser extension, API, or Claude MCP.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 hover:shadow-blue-500/30"
            >
              Open your vault
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 hover:shadow-blue-500/30"
              >
                Get Founding Access — $9
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                See how it works
              </a>
            </>
          )}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {trustItems.map(({ label }) => (
            <div key={label} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {label}
            </div>
          ))}
        </div>

        {/* Product demo visual */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          {/* Glow behind the card */}
          <div className="absolute inset-x-10 -bottom-4 h-16 bg-blue-500/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                app.dumpit.app/dashboard
              </div>
            </div>

            {/* App content */}
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* Left — AI ask */}
              <div className="border-b border-slate-200 p-5 dark:border-slate-800 lg:border-b-0 lg:border-r">
                <div className="mb-3 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Ask DumpIt</span>
                  <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">All sources</span>
                </div>
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  What patterns should I use for RAG with citations?
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-4 dark:border-blue-950 dark:bg-blue-950/30">
                  <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                    <Zap className="h-3.5 w-3.5" />
                    Answer from your vault
                  </div>
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                    Use chunk-level citation metadata — store source title, URL, and chunk index with every vector. Return the N closest chunks with their source refs as footnotes in the answer.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="app-chip">[1] RAG patterns</span>
                    <span className="app-chip">[2] Vector design</span>
                    <span className="app-chip">[3] Citation UX</span>
                  </div>
                </div>
              </div>

              {/* Right — Saved items */}
              <div className="bg-slate-50 p-5 dark:bg-slate-950/60">
                <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Recent saves</div>
                <div className="space-y-2.5">
                  {[
                    { icon: Link2, label: 'RAG citation patterns guide', type: 'Link', color: 'text-blue-500' },
                    { icon: FileText, label: 'Gemini Flash prompt design.pdf', type: 'PDF', color: 'text-violet-500' },
                    { icon: StickyNote, label: 'API design notes — v2 endpoints', type: 'Note', color: 'text-amber-500' },
                  ].map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        <ItemIcon className={`h-4 w-4 shrink-0 ${item.color}`} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.label}</div>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{item.type}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
