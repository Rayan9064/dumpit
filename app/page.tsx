'use client'

import Navbar from './components/landing/Navbar'
import Hero from './components/landing/Hero'
import FounderNote from './components/landing/Vision'    // Founder note (replaces Social Proof)
import Roadmap from './components/landing/Roadmap'
import HowItWorks from './components/landing/HowItWorks'
import Platform from './components/landing/Platform'
import Features from './components/landing/Features'     // Content Types
import ApiSection from './components/landing/ApiSection'
import Pricing from './components/landing/Pricing'
import FAQ from './components/landing/FAQ'
import FinalCTA from './components/landing/FinalCTA'
import Footer from './components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <Hero />
      <FounderNote />      {/* Founder note — replaces fake social proof */}
      <Roadmap />          {/* Compact roadmap: Live / Building now / Next */}
      <HowItWorks />       {/* 4-step process */}
      <Platform />         {/* Web / Extension / API / MCP */}
      <Features />         {/* Content Types: links, notes, PDFs, etc. */}
      <ApiSection />       {/* API & MCP code block */}
      <Pricing />          {/* Founding CTA + 3 tiers */}
      <FAQ />           {/* 6 FAQ accordion */}
      <FinalCTA />      {/* Stop losing what you learn */}
      <Footer />
    </div>
  )
}
