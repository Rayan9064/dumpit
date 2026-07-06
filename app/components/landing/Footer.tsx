import { Github, Linkedin } from 'lucide-react'
import Link from '../ui/Link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="DumpIt" className="h-8 w-8 object-contain" />
            <span className="font-bold text-slate-950 dark:text-white">DumpIt</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            AI knowledge vault for saved links. (c) {currentYear}
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <a href="https://github.com/Rayan9064/dumpit" aria-label="GitHub" className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white">
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
