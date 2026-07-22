// FounderNote — replaces old Social Proof / Vision section
// Honest "why I'm building this" note. No fabricated stats or avatars.

const FounderNote = () => {
  return (
    <section className="border-b border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-stone-50 p-8 dark:border-slate-800 dark:bg-slate-900/60">
          {/* Author row */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              R
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Rayan</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Building DumpIt</div>
            </div>
          </div>

          {/* Founder note body — REPLACE THE PLACEHOLDER BELOW WITH YOUR ACTUAL TEXT */}
          <blockquote className="text-base leading-8 text-slate-700 dark:text-slate-300">
            {/*
             * ──────────────────────────────────────────────────────────────
             * FOUNDER NOTE — paste your 3–4 sentence text here.
             * Keep it honest, first-person, casual. No corporate speak.
             * Example structure:
             *   - Why you started building this
             *   - The specific pain you felt
             *   - What you hope it becomes
             *   - An honest admission of where it is right now
             * ──────────────────────────────────────────────────────────────
             */}
            <p className="italic text-slate-400 dark:text-slate-500">
              [Your founder note goes here — a few honest sentences about why you're building DumpIt,
              the problem you kept running into, and what you're trying to make possible.
              Supply the text and it'll be dropped in exactly here.]
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

export default FounderNote
