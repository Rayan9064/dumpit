// Social Proof Bar — replaces old Vision section
const avatars = [
  { initials: 'RK', color: 'bg-blue-500' },
  { initials: 'AS', color: 'bg-violet-500' },
  { initials: 'MJ', color: 'bg-emerald-500' },
  { initials: 'PT', color: 'bg-amber-500' },
  { initials: 'DN', color: 'bg-rose-500' },
]

const SocialProof = () => {
  return (
    <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        {/* Avatar stack + user count */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {avatars.map((a) => (
              <div
                key={a.initials}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-white dark:ring-slate-950 ${a.color}`}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-950 dark:text-white">200+ developers</span> and knowledge workers already saving smarter
          </div>
        </div>

        {/* Founding offer pill */}
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/70"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          First 500 founding members get 50% off Pro — forever
        </a>
      </div>
    </section>
  )
}

export default SocialProof
