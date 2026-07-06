import { Bot, FolderKanban, Globe2, LockKeyhole, Search, Tags } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Ask across your vault',
    description: 'Use natural language to query indexed resources and receive cited answers.',
  },
  {
    icon: Search,
    title: 'Semantic retrieval',
    description: 'Find relevant links even when your question does not match the original title.',
  },
  {
    icon: LockKeyhole,
    title: 'Private and shared modes',
    description: 'Separate personal knowledge from public discoveries with explicit visibility states.',
  },
  {
    icon: FolderKanban,
    title: 'Collections that stay useful',
    description: 'Group links by project, course, research topic, or workflow.',
  },
  {
    icon: Tags,
    title: 'Tags and metadata',
    description: 'Capture context up front with enrichment, notes, tags, and source details.',
  },
  {
    icon: Globe2,
    title: 'Community discovery',
    description: 'Browse public resources, save the useful ones, and make them part of your own vault.',
  },
]

const Features = () => {
  return (
    <section className="border-b border-slate-200 bg-stone-50 py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="app-chip mb-4">Product surface</span>
            <h2 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              Built around retrieval, not folders for folders' sake.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              The interface should help users ask, verify, save, and refine. Every feature supports that loop.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="app-panel p-5">
                  <Icon className="mb-4 h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
