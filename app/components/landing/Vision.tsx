import { Archive, Brain, FileSearch, MessageSquareQuote } from 'lucide-react'

const steps = [
  {
    icon: Archive,
    title: 'Capture the useful link',
    text: 'Save articles, docs, videos, tools, or notes into a private vault with optional collections.',
  },
  {
    icon: Brain,
    title: 'Let DumpIt index it',
    text: 'Readable text is extracted, chunked, embedded, and prepared for semantic search.',
  },
  {
    icon: FileSearch,
    title: 'Search by meaning',
    text: 'Ask naturally instead of remembering exact titles, URLs, or tags.',
  },
  {
    icon: MessageSquareQuote,
    title: 'Verify with sources',
    text: 'Answers include citations and source cards so users can inspect the underlying resource.',
  },
]

const Vision = () => {
  return (
    <section id="workflow" className="border-b border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="app-chip app-chip-ai mb-4">How it works</span>
          <h2 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
            From saved link to cited answer.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            DumpIt keeps the familiar resource workflow, then adds a retrieval layer that makes saved knowledge usable again.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <article key={step.title} className="app-panel p-5">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600">Step {index + 1}</div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Vision
