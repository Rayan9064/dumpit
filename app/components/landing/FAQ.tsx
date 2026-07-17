'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is my data private?',
    a: 'Yes. All resources are private by default. Only content you explicitly mark as public appears on your /u/username profile. Your vault is only accessible to you and your API key.',
  },
  {
    q: 'What happens after beta?',
    a: "Founding members lock in their discounted rate permanently. Everyone else moves to the standard pricing. We'll give at least 30 days notice before any billing changes — and free tier users stay free.",
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. Pro accounts can export all saved resources, notes, and metadata as JSON or CSV at any time. Your data is yours.',
  },
  {
    q: 'What AI model does DumpIt use?',
    a: 'DumpIt uses Google Gemini 2.5 Flash for AI answer generation and Gemini Embedding-001 for semantic vector search. This keeps costs extremely low — less than $0.001 per typical AI query.',
  },
  {
    q: 'Does the browser extension store my browsing history?',
    a: "No. The extension only acts when you explicitly click 'Save to DumpIt'. It doesn't monitor background tabs or collect any passive browsing data.",
  },
  {
    q: 'Can I use DumpIt with Claude / other AI tools?',
    a: 'Yes. The Claude MCP integration lets you query your DumpIt vault directly from Claude Desktop. The REST API lets you integrate with any tool. Both are included in Pro.',
  },
]

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="scroll-mt-20 border-b border-slate-200 bg-white py-24 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="app-chip mb-4">FAQ</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Common questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className="app-panel overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open === index ? 'rotate-180' : ''}`}
                />
              </button>
              {open === index && (
                <div className="border-t border-slate-200 px-5 pb-5 pt-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
