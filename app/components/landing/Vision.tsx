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
            <p>
              I&apos;m building DumpIt because I kept losing things I&apos;d already learned — a link I read last month, a note I wrote last week, a PDF I forgot I even saved. Most tools just dump your stuff in a folder and leave you to search for it later.
            </p>
            <p className="mt-4">
              What I actually want is a second brain — for me and my team — that doesn&apos;t just store things but understands them. Something where you can save anything digital, ask questions across all of it, share what&apos;s useful, and keep the rest private. And eventually, not just a place to retrieve knowledge but a system that can act on it.
            </p>
            <p className="mt-4">
              It&apos;s early. Links and notes work today, more is coming. If this sounds like something you&apos;ve been looking for, I&apos;d love to build it with your feedback.
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

export default FounderNote
