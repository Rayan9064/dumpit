'use client'

import { ArrowRight, LibraryBig, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

const CTA = () => {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <section id="discover" className="bg-slate-950 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
            <Share2 className="h-3.5 w-3.5" />
            Shared knowledge
          </span>
          <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">
            Build your own vault, then learn from what others share.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Keep personal resources private, publish useful links when they are worth sharing, and query both surfaces from one AI workspace.
          </p>
          <button
            onClick={() => router.push(user ? '/dashboard' : '/login?signup=true')}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            Open DumpIt
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-3">
            <LibraryBig className="h-5 w-5 text-blue-300" />
            <div className="font-semibold">Shared Dump preview</div>
          </div>
          <div className="space-y-3">
            {['RAG UX citation patterns', 'Firebase vector search notes', 'Next.js auth boundary checklist'].map((item, index) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <div className="text-sm font-semibold">{item}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>[{index + 1}]</span>
                  <span>Public source</span>
                  <span>Saved by community</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
