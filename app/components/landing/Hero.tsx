'use client'

import { ArrowRight, Bot, CheckCircle2, Database, ExternalLink, Lock, Search, Sparkles } from 'lucide-react'
import Link from '../ui/Link'

const sources = [
  { label: 'Firebase Auth guide', type: 'Private', tag: 'Docs' },
  { label: 'RAG patterns for citations', type: 'Shared', tag: 'AI' },
  { label: 'Next.js route handlers', type: 'Private', tag: 'Code' },
]

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-stone-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-60 dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="DumpIt" className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold text-slate-950 dark:text-white">DumpIt</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#workflow" className="hover:text-slate-950 dark:hover:text-white">Workflow</a>
            <a href="#trust" className="hover:text-slate-950 dark:hover:text-white">Trust</a>
            <a href="#discover" className="hover:text-slate-950 dark:hover:text-white">Discover</a>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
          <div>
            <div className="app-chip app-chip-ai mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              AI knowledge vault for saved links
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-normal text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Ask your saved internet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              DumpIt turns the links you save into an AI-searchable workspace. Capture useful resources, keep private and shared knowledge separate, then get answers with source citations.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?signup=true"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Start your vault
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#workflow"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                See the workflow
              </a>
            </div>

            <div className="mt-8 grid max-w-xl gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                Private by default
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                Indexed sources
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                Cited answers
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Ask DumpIt</span>
                </div>
                <span className="app-chip app-chip-success">All sources</span>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="border-b border-slate-200 p-5 dark:border-slate-800 lg:border-b-0 lg:border-r">
                  <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">What should I read before implementing Firebase auth?</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-950 dark:bg-blue-950/30">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
                      <Sparkles className="h-4 w-4" />
                      Answer from your vault
                    </div>
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                      Start with Firebase ID token verification, then move ownership checks server-side. Your saved Next.js route handler notes explain the API boundary, and the RAG citation guide covers why answers should include sources.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="app-chip">[1] Auth guide</span>
                      <span className="app-chip">[2] Route handlers</span>
                      <span className="app-chip">[3] Citation pattern</span>
                    </div>
                  </div>
                </div>

                <aside className="bg-slate-50 p-5 dark:bg-slate-950/70">
                  <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sources</div>
                  <div className="space-y-3">
                    {sources.map((source, index) => (
                      <div key={source.label} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-blue-600">[{index + 1}]</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{source.type}</span>
                        </div>
                        <div className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{source.label}</div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>{source.tag}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
