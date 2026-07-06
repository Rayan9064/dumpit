'use client'

import Hero from './components/landing/Hero'
import Vision from './components/landing/Vision'
import Features from './components/landing/Features'
import Pricing from './components/landing/Pricing'
import CTA from './components/landing/CTA'
import Footer from './components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Hero />
      <Vision />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
