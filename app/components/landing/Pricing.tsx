import { CheckCircle2, ShieldCheck } from 'lucide-react'

const points = [
  'No billing wall while the product is in beta',
  'Private resources stay scoped to your authenticated account',
  'AI answers show sources instead of asking for blind trust',
]

const Pricing = () => {
  return (
    <section id="trust" className="border-b border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <span className="app-chip app-chip-success mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trust model
          </span>
          <h2 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
            AI that shows its work.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            DumpIt is designed for verification: answers are tied back to saved links, public/shared content is clearly marked, and private retrieval depends on authenticated ownership.
          </p>
        </div>

        <div className="app-panel p-6">
          <div className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Early access</div>
          <div className="text-4xl font-bold text-slate-950 dark:text-white">Free while in beta</div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            The current product focus is a reliable AI knowledge workflow, not paid plans.
          </p>
          <div className="mt-6 space-y-3">
            {points.map((point) => (
              <div key={point} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
