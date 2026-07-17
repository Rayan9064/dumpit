'use client'

import { ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

const FinalCTA = () => {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <section className="relative overflow-hidden bg-slate-950 py-28 text-white">
      {/* Background glow */}
      <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Limited founding member offer
          </span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Stop losing what
          <br />
          you learn.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
          Every link you save and forget is knowledge lost. DumpIt makes your saved content answerable.
        </p>

        {user ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-950 shadow-xl transition hover:bg-slate-100"
          >
            Open your vault
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href="#founding"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/20 transition hover:bg-blue-500"
            >
              Get Founding Access — $9
              <ArrowRight className="h-4 w-4" />
            </a>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> 30-day money back</span>
              <span>·</span>
              <span>Cancel anytime</span>
              <span>·</span>
              <span>Stripe-secured</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default FinalCTA
