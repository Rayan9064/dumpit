// Roadmap — compact 4-item visual strip, consistent with zinc/Space Grotesk design system

const roadmapItems = [
  {
    label: 'Save links & notes',
    description: 'Bookmark any URL or write plain-text notes. Both are indexed and AI-searchable.',
    status: 'live' as const,
  },
  {
    label: 'Ask DumpIt (AI / RAG)',
    description: 'Semantic search and answer generation across your entire saved knowledge base.',
    status: 'live' as const,
  },
  {
    label: 'PDF upload',
    description: 'Upload documents and make their full text AI-searchable alongside your links.',
    status: 'building' as const,
  },
  {
    label: 'Browser extension',
    description: 'Clip pages and highlights directly from Chrome without switching tabs.',
    status: 'next' as const,
  },
]

const statusConfig = {
  live: {
    label: 'Live',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  },
  building: {
    label: 'Building now',
    dot: 'bg-blue-500 animate-pulse',
    pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  },
  next: {
    label: 'Next',
    dot: 'bg-violet-400',
    pill: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
  },
  planned: {
    label: 'Planned',
    dot: 'bg-slate-300 dark:bg-slate-600',
    pill: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  },
}

const Roadmap = () => {
  return (
    <section id="roadmap" className="scroll-mt-20 border-b border-slate-200 bg-stone-50 py-16 dark:border-slate-800 dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="app-chip mb-2">Roadmap</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              What's live, what's next.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
            Building in public. This is the honest current state of the product.
          </p>
        </div>

        {/* Item grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roadmapItems.map((item, index) => {
            const cfg = statusConfig[item.status]
            return (
              <div
                key={item.label}
                className="app-panel relative flex flex-col gap-3 p-5"
              >
                {/* Step number */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {/* Status pill */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.pill}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">{item.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Roadmap
