'use client'

import { ArrowLeft, Shield, Lock, Eye, FileText, Database, ShieldAlert } from 'lucide-react'
import Link from '../components/ui/Link'
import Footer from '../components/landing/Footer'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold text-slate-950 dark:text-white">DumpIt</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-850 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Last updated: July 14, 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-350">
          
          <p>
            At DumpIt, your privacy is a core priority. This Privacy Policy describes how we collect, use, and share your personal information when you use our web application, extension, and related services (collectively, the <strong>&quot;Service&quot;</strong>). By using DumpIt, you agree to the collection and use of information in accordance with this policy.
          </p>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Eye className="h-5 w-5 text-blue-500" />
              1. Information We Collect
            </h2>
            <p>
              We collect information to provide, personalize, and improve our AI-powered knowledge vault services. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> When you sign up using Google Authentication or email, we receive your email address, name, and profile picture.
              </li>
              <li>
                <strong>User Content (Dumps):</strong> We collect the links, URLs, titles, notes, and tags that you explicitly save (&quot;dump&quot;) to your vault.
              </li>
              <li>
                <strong>AI Search Queries:</strong> We store the queries and questions you enter when searching or interacting with your vault via the &quot;Ask DumpIt&quot; interface to retrieve relevant context and generate answers.
              </li>
              <li>
                <strong>Technical Data:</strong> We may collect browser details, IP addresses, cookies, and extension logs required for the Service&apos;s security and runtime functionality.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Database className="h-5 w-5 text-blue-500" />
              2. How We Use Your Information
            </h2>
            <p>
              Your information is used to power the core functionality of DumpIt:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Retrieval & Search:</strong> Indexing your saved links, text content, and documents so you can query and retrieve them via semantic search.
              </li>
              <li>
                <strong>AI Generation:</strong> Submitting relevant snippets of your saved sources to third-party AI models to generate cited answers to your questions.
              </li>
              <li>
                <strong>Public Sharing:</strong> Hosting your public sharing pages (e.g., <code>/u/[username]</code>) when you explicitly configure links or profile cards to be publicly accessible.
              </li>
              <li>
                <strong>Security:</strong> Preventing abuse, unauthorized access, or violating the Terms of Service.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Lock className="h-5 w-5 text-blue-500" />
              3. Data Sharing & Third-Party Services
            </h2>
            <p>
              We do not sell your personal data. We share details with trusted infrastructure providers required to operate the Service:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Firebase (Google Cloud):</strong> We use Firebase Authentication and Firestore/Realtime databases to store user profiles and resource objects.
              </li>
              <li>
                <strong>AI Model Providers (OpenAI / Gemini / Anthropic):</strong> When you ask questions, relevant snippets of your saved content are passed as context to AI models. These models do not use your private documents to train public models.
              </li>
              <li>
                <strong>Hosting:</strong> Vercel or similar cloud hosting providers hosting our web servers.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <ShieldAlert className="h-5 w-5 text-blue-500" />
              4. Data Control & GDPR / CCPA Rights
            </h2>
            <p>
              Depending on your location, you may have specific data rights, which DumpIt respects globally:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Access & Export:</strong> You can view all your saved resources and notes directly within your DumpIt Dashboard.
              </li>
              <li>
                <strong>Deletion:</strong> You can delete individual resources, notes, or tags at any time. To permanently delete your entire account and all associated data, you can contact us at support@dumpit.com.
              </li>
              <li>
                <strong>Opt-Out of Sharing:</strong> Your links are private by default. They are only shared publicly if you explicitly enable sharing or assign them to a public profile.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-blue-500" />
              5. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please feel free to reach out to us at:
            </p>
            <p className="font-semibold text-slate-950 dark:text-white">
              Email: support@dumpit.com
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
