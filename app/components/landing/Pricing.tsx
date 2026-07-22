import { ArrowRight, CheckCircle2, Flame, ShieldCheck, Zap } from 'lucide-react'

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Get a feel for the dump-index-ask loop.',
    color: 'border-slate-200 dark:border-slate-800',
    cta: { label: 'Get started free', href: '/login?signup=true', style: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800' },
    features: [
      '50 resources (links, notes, PDFs)',
      '15 AI Ask queries / month',
      '3 collections',
      'Public profile at /u/username',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    annualNote: '$90/year — save 17%',
    description: 'Unlimited knowledge. Full platform access.',
    color: 'border-blue-500 ring-2 ring-blue-500/20',
    badge: 'Most popular',
    cta: { label: 'Get Founding Access — $4.50/mo', href: '#founding', style: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25' },
    features: [
      'Unlimited resources (all types)',
      '300 AI Ask queries / month',
      'Unlimited collections',
      'Browser extension',
      'REST API access (1,000 calls/mo)',
      'PDF & document upload',
      'Profile analytics',
      'Data export (JSON / CSV)',
    ],
  },
  {
    name: 'API / Dev',
    price: '$14',
    period: '/month',
    description: 'Build on DumpIt. Pure programmatic access.',
    color: 'border-slate-200 dark:border-slate-800',
    cta: { label: 'Start with API', href: '#founding', style: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800' },
    features: [
      '2,000 API calls / month',
      'Claude MCP integration',
      '500 AI Ask queries / month',
      'Webhook support',
      '5 API keys',
    ],
  },
]

const Pricing = () => {
  return (
    <section id="pricing" className="scroll-mt-20 border-b border-slate-200 bg-white py-24 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Founding member callout */}
        <div id="founding" className="scroll-mt-20 mb-14 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 p-6 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-violet-950/40 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Founding Member Offer</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                Early supporters get 50% off Pro — forever.
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                <strong>$4.50/month</strong> instead of $9. Locked in as long as your subscription is active.
              </p>
              {/* No scarcity counter — add a real claimed-spot number here when you have one */}
            </div>
            <div className="flex flex-col gap-2 sm:shrink-0">
              <a
                href="https://buy.stripe.com/founding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
              >
                <Zap className="h-4 w-4" />
                Get Founding Access — $4.50/mo
                <ArrowRight className="h-4 w-4" />
              </a>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Stripe-secured · 30-day money back</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="app-chip mb-4">Pricing</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            95–99% gross margin means we can keep AI costs absurdly low. You get powerful AI at coffee prices.
          </p>
        </div>

        {/* Tiers */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className={`relative flex flex-col rounded-2xl border bg-white p-8 dark:bg-slate-900 ${tier.color}`}>
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                  {tier.badge}
                </div>
              )}
              <div className="mb-6">
                <div className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{tier.name}</div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-950 dark:text-white">{tier.price}</span>
                  {tier.period && <span className="mb-1 text-slate-500 dark:text-slate-400">{tier.period}</span>}
                </div>
                {tier.annualNote && <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">{tier.annualNote}</div>}
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tier.description}</p>
              </div>

              <a
                href={tier.cta.href}
                className={`mb-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${tier.cta.style}`}
              >
                {tier.cta.label}
              </a>

              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
