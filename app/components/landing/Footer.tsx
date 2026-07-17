import { Github, Twitter } from 'lucide-react'
import Link from '../ui/Link'

const productLinks = [
  { label: 'Features', href: '#content-types' },
  { label: 'Platform', href: '#platform' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'API & MCP', href: '#api' },
  { label: 'Changelog', href: '#' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
              <span className="text-base font-bold text-slate-950 dark:text-white">DumpIt</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
              The AI second brain for everything you save, read, and learn. Index it once. Ask anything.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://github.com/Rayan9064/dumpit"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/DumpItApp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Product</div>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Legal</div>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Get started</div>
            <a
              href="#pricing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Founding Access →
            </a>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">First 500 get 50% off Pro</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {currentYear} DumpIt. Built with{' '}
            <span className="text-red-500">♥</span> using Next.js, Gemini, and Firebase.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
