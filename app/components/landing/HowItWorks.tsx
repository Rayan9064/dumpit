import { Bot, FileText, Flame, Globe2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Save from anywhere',
    description: 'Paste a URL, upload a PDF, write a note, or use the browser extension. DumpIt accepts any format.',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
  },
  {
    number: '02',
    icon: Bot,
    title: 'AI indexes it instantly',
    description: 'Text is extracted, chunked, and embedded with Gemini. Every save becomes searchable by meaning.',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-400',
  },
  {
    number: '03',
    icon: Flame,
    title: 'Ask across everything',
    description: 'Natural language questions. Cited answers from your own saved content — not the open web.',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
  },
  {
    number: '04',
    icon: Globe2,
    title: 'Share or keep private',
    description: 'Public profile at /u/username or keep everything locked to your account. You control visibility per resource.',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-slate-200 bg-white py-24 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="app-chip mb-4">How it works</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            From save to answer in seconds.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Four steps from raw resource to AI-cited knowledge.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative flex flex-col">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+32px)] top-6 hidden h-px w-[calc(100%+24px)] border-t-2 border-dashed border-slate-200 dark:border-slate-800 lg:block" />
                )}
                <div className="app-panel flex flex-col p-6">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Step {step.number}</div>
                  <h3 className="mb-2 font-bold text-slate-950 dark:text-white">{step.title}</h3>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
