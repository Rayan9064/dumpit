import { Chrome, Code2, FileText, Globe2 } from 'lucide-react'

const surfaces = [
  {
    icon: Globe2,
    title: 'Web App',
    tag: 'Live',
    description: 'Full dashboard with AI search, collections, and profile management. Works in any browser.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    preview: (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">app.dumpit.app/dashboard</span>
        </div>
        <div className="space-y-1.5">
          {['RAG citation patterns', 'Firebase auth guide', 'Next.js deployment.pdf'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-xs text-slate-700 dark:text-slate-200">{item}</span>
              <span className="text-[10px] font-bold text-blue-500">AI</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Chrome,
    title: 'Browser Extension',
    tag: 'Coming soon',
    description: '1-click save from any tab. Highlight text, save the page, clip screenshots — without leaving the browser.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    preview: (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-white">DumpIt</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Extension</span>
        </div>
        <div className="rounded border border-slate-200 bg-white p-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          vercel.com/docs/functions/serverless
        </div>
        <button className="w-full rounded bg-emerald-600 py-1.5 text-xs font-semibold text-white">
          Save to vault ↩
        </button>
      </div>
    ),
  },
  {
    icon: Code2,
    title: 'REST API',
    tag: 'Pro',
    description: 'Programmatic access to your vault. Add resources, search by query, retrieve chunks — integrate with anything.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    preview: (
      <div className="rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-xs dark:border-slate-700">
        <div className="text-slate-500">$ curl -X POST https://dumpit.app/api/resources \</div>
        <div className="text-slate-400">  -H <span className="text-emerald-400">"Authorization: Bearer {'{'}key{'}'}"</span> \</div>
        <div className="text-slate-400">  -d <span className="text-amber-400">'{'{'}link{":'https://example.com'"}{'}'}'</span></div>
        <div className="mt-2 text-emerald-400">{'{'} "success": true, "id": "r_abc123" {'}'}</div>
      </div>
    ),
  },
  {
    icon: FileText,
    title: 'Claude MCP',
    tag: 'Pro',
    description: 'Query your DumpIt vault directly from Claude. Ask your second brain without switching apps.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    preview: (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">Claude + DumpIt MCP</div>
        <div className="rounded border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-xs font-medium text-slate-400">You</div>
          <div className="text-xs text-slate-700 dark:text-slate-200">What did I save about Gemini pricing?</div>
        </div>
        <div className="mt-1.5 rounded border border-blue-100 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="text-xs font-medium text-blue-500">Claude via DumpIt</div>
          <div className="text-xs text-slate-700 dark:text-slate-200">From your vault: Gemini Flash is $0.15/M input... [Source: dumpit_plan.md]</div>
        </div>
      </div>
    ),
  },
]

const Platform = () => {
  return (
    <section id="platform" className="scroll-mt-20 border-b border-slate-200 bg-stone-50 py-24 dark:border-slate-800 dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="app-chip mb-4">Platform</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Every surface, one vault.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Web app, browser extension, REST API, Claude MCP — save and query your knowledge from anywhere.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {surfaces.map((surface) => {
            const Icon = surface.icon
            return (
              <article key={surface.title} className="app-panel flex flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${surface.bg}`}>
                    <Icon className={`h-5 w-5 ${surface.color}`} />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {surface.tag}
                  </span>
                </div>
                <h3 className="mb-1 font-bold text-slate-950 dark:text-white">{surface.title}</h3>
                <p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{surface.description}</p>
                {surface.preview}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Platform
