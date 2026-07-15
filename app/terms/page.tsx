import type { Metadata } from 'next'
import { Scale, ShieldAlert, Key, UserCheck, AlertTriangle, HelpCircle } from 'lucide-react'
import { LegalNav } from '../components/ui/LegalNav'
import Footer from '../components/landing/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service · DumpIt',
  description: 'Read the Terms of Service governing your use of DumpIt.',
}

const sections = [
  {
    icon: UserCheck,
    title: '1. Account Registration &amp; Security',
    content: (
      <>
        <p>To use many features of the Service, you must register for an account using email or Google Sign-In. You agree to:</p>
        <ul>
          <li>Provide accurate and complete information during registration.</li>
          <li>Keep your login credentials secure at all times.</li>
          <li>Notify us immediately of any unauthorized use or security breach of your account.</li>
          <li>Accept sole responsibility for all activities that occur under your account.</li>
        </ul>
      </>
    ),
  },
  {
    icon: Key,
    title: '2. Acceptable Use of the Service',
    content: (
      <>
        <p>You are responsible for your use of the Service, and for any content you save, share, or query. You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or to promote illegal activities.</li>
          <li>Upload, save, or share content that infringes upon the intellectual property rights of others.</li>
          <li>Attempt to disrupt, breach, or compromise the security or integrity of our systems or networks.</li>
          <li>Use scrapers, robots, or automated scripts to harvest data from the Service without permission.</li>
          <li>Misuse the AI search features by inputting prompts designed to cause harm or violate safety standards.</li>
        </ul>
      </>
    ),
  },
  {
    icon: ShieldAlert,
    title: '3. User Content &amp; Public Sharing',
    content: (
      <>
        <p>You retain all ownership rights in the links, resources, notes, and content you submit to the Service. However:</p>
        <ul>
          <li><strong>Privacy:</strong> By default, all resources and notes saved to your vault are private and accessible only to you.</li>
          <li><strong>Public Sharing:</strong> If you choose to enable public sharing or publish a public profile (e.g., <code>/u/[username]</code>), you grant us a license to host, display, and distribute that designated content to the public on your behalf.</li>
          <li><strong>AI Context:</strong> You grant us the right to process your saved resources and queries through third-party AI models solely to provide you with search results and answers.</li>
        </ul>
      </>
    ),
  },
  {
    icon: AlertTriangle,
    title: '4. Disclaimer of Warranties &amp; Limitation of Liability',
    content: (
      <>
        <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DumpIt makes no warranties, express or implied, regarding the reliability, completeness, or accuracy of the Service, including the AI-generated answers.</p>
        <p>In no event shall DumpIt, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of or inability to use the Service.</p>
      </>
    ),
  },
  {
    icon: HelpCircle,
    title: '5. Contact Us',
    content: (
      <>
        <p>If you have any questions or require clarification regarding these Terms of Service, please contact us:</p>
        <p><a href="mailto:support@dumpit.app" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">support@dumpit.app</a></p>
      </>
    ),
  },
]

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50 flex flex-col">
      <LegalNav />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-stone-50 py-10 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: July 14, 2026</p>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Welcome to DumpIt! These Terms govern your access to and use of our web application, extension, and related services. By using DumpIt you agree to be bound by these Terms and our Privacy Policy.
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
                  <span dangerouslySetInnerHTML={{ __html: s.title }} />
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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
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
