import type { Metadata } from 'next'
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import Footer from '../components/landing/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy · DumpIt',
  description: 'Learn how DumpIt collects, uses, and protects your personal information.',
}

const sections = [
  {
    icon: Eye,
    title: '1. Information We Collect',
    content: (
      <>
        <p>We collect information to provide, personalize, and improve our AI-powered knowledge vault services. This includes:</p>
        <ul>
          <li><strong>Account Information:</strong> When you sign up using Google Authentication or email, we receive your email address, name, and profile picture.</li>
          <li><strong>User Content (Dumps):</strong> We collect the links, URLs, titles, notes, and tags that you explicitly save ("dump") to your vault.</li>
          <li><strong>AI Search Queries:</strong> We store the queries and questions you enter when searching or interacting with your vault via the "Ask DumpIt" interface to retrieve relevant context and generate answers.</li>
          <li><strong>Technical Data:</strong> We may collect browser details, IP addresses, cookies, and extension logs required for the Service's security and runtime functionality.</li>
        </ul>
      </>
    ),
  },
  {
    icon: Database,
    title: '2. How We Use Your Information',
    content: (
      <>
        <p>Your information is used to power the core functionality of DumpIt:</p>
        <ul>
          <li><strong>Retrieval &amp; Search:</strong> Indexing your saved links, text content, and documents so you can query and retrieve them via semantic search.</li>
          <li><strong>AI Generation:</strong> Submitting relevant snippets of your saved sources to third-party AI models to generate cited answers to your questions.</li>
          <li><strong>Public Sharing:</strong> Hosting your public sharing pages (e.g., <code>/u/[username]</code>) when you explicitly configure links or profile cards to be publicly accessible.</li>
          <li><strong>Security:</strong> Preventing abuse, unauthorized access, or violating the Terms of Service.</li>
        </ul>
      </>
    ),
  },
  {
    icon: Lock,
    title: '3. Data Sharing &amp; Third-Party Services',
    content: (
      <>
        <p>We do not sell your personal data. We share details with trusted infrastructure providers required to operate the Service:</p>
        <ul>
          <li><strong>Firebase (Google Cloud):</strong> We use Firebase Authentication and Firestore databases to store user profiles and resource objects.</li>
          <li><strong>AI Model Providers (Google Gemini):</strong> When you ask questions, relevant snippets of your saved content are passed as context to AI models. These models do not use your private documents to train public models.</li>
          <li><strong>Hosting:</strong> Vercel or similar cloud hosting providers hosting our web servers.</li>
        </ul>
      </>
    ),
  },
  {
    icon: ShieldAlert,
    title: '4. Data Control &amp; GDPR / CCPA Rights',
    content: (
      <>
        <p>Depending on your location, you may have specific data rights, which DumpIt respects globally:</p>
        <ul>
          <li><strong>Access &amp; Export:</strong> You can view all your saved resources and notes directly within your DumpIt Dashboard.</li>
          <li><strong>Deletion:</strong> You can delete individual resources, notes, or tags at any time. To permanently delete your entire account and all associated data, contact us at <a href="mailto:support@dumpit.app">support@dumpit.app</a>.</li>
          <li><strong>Opt-Out of Sharing:</strong> Your links are private by default. They are only shared publicly if you explicitly enable sharing or assign them to a public profile.</li>
        </ul>
      </>
    ),
  },
  {
    icon: FileText,
    title: '5. Contact Us',
    content: (
      <>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please reach out to us:</p>
        <p><a href="mailto:support@dumpit.app" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">support@dumpit.app</a></p>
      </>
    ),
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
            <span className="text-base font-bold text-slate-900 dark:text-white">DumpIt</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-stone-50 py-10 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: July 14, 2026</p>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            At DumpIt, your privacy is a core priority. This policy describes how we collect, use, and protect your personal information when you use our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick nav */}
        <nav className="mb-10 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">On this page</p>
          <ol className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.title}>
                <a
                  href={`#${s.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          {sections.map((section) => {
            const Icon = section.icon
            const id = section.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
            return (
              <section
                key={id}
                id={id}
                className="scroll-mt-20 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
              >
                <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: section.title }} />
                </h2>
                <div className="space-y-3 text-[15px] leading-7 text-slate-600 dark:text-slate-400 [&_a]:text-blue-600 [&_a:hover]:underline dark:[&_a]:text-blue-400 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono [&_code]:text-slate-700 dark:[&_code]:bg-slate-800 dark:[&_code]:text-slate-300 [&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-200 [&_ul]:mt-2 [&_ul]:space-y-2.5 [&_ul]:pl-5 [&_ul]:list-disc [&_p+p]:mt-2">
                  {section.content}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
