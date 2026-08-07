'use client'

import { ArrowRight, Zap } from 'lucide-react'
import type { User } from 'firebase/auth'
import { getDodoCheckoutUrl } from '../../lib/dodoCheckout'

interface UpgradePromptProps {
  message: string
  user?: User | null
}

export function UpgradePrompt({ message, user }: UpgradePromptProps) {
  return (
    <div className="app-panel flex flex-col gap-3 border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-900 dark:text-blue-200">{message}</p>
      </div>
      <a
        href={getDodoCheckoutUrl(user)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
      >
        Upgrade to Pro
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

export const isUpgradeRequiredError = (status: number, body: unknown): boolean => (
  status === 403 && typeof body === 'object' && body !== null && (body as { code?: string }).code === 'UPGRADE_REQUIRED'
)
