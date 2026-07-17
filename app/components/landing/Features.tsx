import { Chrome, Clock, FileText, Link2, StickyNote, Youtube } from 'lucide-react'

const types = [
  {
    icon: Link2,
    label: 'Web links',
    description: 'Articles, docs, videos, tools — any URL. Text is fetched and indexed server-side.',
    status: 'live',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    icon: StickyNote,
    label: 'Notes & text',
    description: 'Write directly in the dashboard. Plain text notes are chunked and embedded instantly.',
    status: 'live',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    icon: FileText,
    label: 'PDF documents',
    description: 'Upload PDF files from your device. Text is parsed, chunked, and made fully searchable.',
    status: 'coming-soon',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
  },
  {
    icon: Chrome,
    label: 'Browser clips',
    description: 'Highlight text or clip a page with one click from the browser extension.',
    status: 'coming-soon',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    icon: Youtube,
    label: 'YouTube videos',
    description: 'Paste a video URL and DumpIt fetches the transcript, making it AI-searchable.',
    status: 'roadmap',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
  },
  {
    icon: Clock,
    label: 'More coming',
    description: 'Tweets, GitHub repos, Notion exports, and more on the roadmap. Shape it with your feedback.',
    status: 'roadmap',
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
  },
]

const statusLabel: Record<string, { label: string; style: string }> = {
  live: { label: 'Live', style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  'coming-soon': { label: 'Coming soon', style: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' },
  roadmap: { label: 'Roadmap', style: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
}

const ContentTypes = () => {
  return (
    <section id="content-types" className="scroll-mt-20 border-b border-slate-200 bg-stone-50 py-24 dark:border-slate-800 dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="app-chip mb-4">Content types</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Not just links.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            DumpIt is your AI second brain for everything you consume — web, notes, PDFs, and more.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => {
            const Icon = type.icon
            const badge = statusLabel[type.status]
            return (
              <article key={type.label} className="app-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${type.bg}`}>
                    <Icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>
                <h3 className="mb-1.5 font-bold text-slate-950 dark:text-white">{type.label}</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{type.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ContentTypes
