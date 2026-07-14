'use client'

import { ArrowLeft, Scale, ShieldAlert, Key, UserCheck, AlertTriangle, HelpCircle } from 'lucide-react'
import Link from '../components/ui/Link'
import Footer from '../components/landing/Footer'

export default function TermsOfService() {
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
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Terms of Service
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
            Welcome to DumpIt! These Terms of Service (<strong>&quot;Terms&quot;</strong>) govern your access to and use of our web application, extension, and related services (collectively, the <strong>&quot;Service&quot;</strong>). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy.
          </p>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <UserCheck className="h-5 w-5 text-blue-500" />
              1. Account Registration & Security
            </h2>
            <p>
              To use many features of the Service, you must register for an account using email or Google Sign-In. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate and complete information during registration.</li>
              <li>Keep your login credentials secure at all times.</li>
              <li>Notify us immediately of any unauthorized use or security breach of your account.</li>
              <li>Accept sole responsibility for all activities that occur under your account.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Key className="h-5 w-5 text-blue-500" />
              2. Acceptable Use of the Service
            </h2>
            <p>
              You are responsible for your use of the Service, and for any content you save, share, or query. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose or to promote illegal activities.</li>
              <li>Upload, save, or share content that infringes upon the intellectual property rights of others.</li>
              <li>Attempt to disrupt, breach, or compromise the security or integrity of our systems or networks.</li>
              <li>Use scrapers, robots, or automated scripts to harvest data from the Service without permission.</li>
              <li>Misuse the AI search features by inputting prompts designed to cause harm or violate safety standards.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <ShieldAlert className="h-5 w-5 text-blue-500" />
              3. User Content & Public Sharing
            </h2>
            <p>
              You retain all ownership rights in the links, resources, notes, and content you submit to the Service. However:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Privacy:</strong> By default, all resources and notes saved to your vault are private and accessible only to you.
              </li>
              <li>
                <strong>Public Sharing:</strong> If you choose to enable public sharing or publish a public profile (e.g., <code>/u/[username]</code>), you grant us a license to host, display, and distribute that designated content to the public on your behalf.
              </li>
              <li>
                <strong>AI Context:</strong> You grant us the right to process your saved resources and queries through third-party AI models solely to provide you with search results and answers.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              4. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. DumpIt makes no warranties, express or implied, regarding the reliability, completeness, or accuracy of the Service, including the AI-generated answers.
            </p>
            <p>
              In no event shall DumpIt, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of or inability to use the Service.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              5. Contact Us
            </h2>
            <p>
              If you have any questions or require clarification regarding these Terms of Service, please contact us:
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
