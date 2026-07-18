'use client'

import { MoreHorizontal } from 'lucide-react'

export function ResourceSkeleton() {
  return (
    <div className="app-panel p-4 space-y-4 animate-pulse border border-slate-200/60 dark:border-slate-800/60">
      {/* Card Header Chips */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tag Chip */}
          <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          {/* Index Status Chip */}
          <div className="h-6 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
          {/* Visibility Chip */}
          <div className="flex h-6 w-16 items-center gap-1 rounded-full bg-slate-200 px-2 dark:bg-slate-800" />
        </div>
        
        {/* Actions Button Skeleton */}
        <div className="rounded-lg p-2 text-slate-200 dark:text-slate-800">
          <MoreHorizontal className="h-5 w-5 opacity-40" />
        </div>
      </div>

      {/* Resource Title */}
      <div className="space-y-2">
        <div className="h-5 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Note Content */}
      <div className="space-y-1.5 pt-1">
        <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-900" />
        <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-900" />
      </div>

      {/* Collection Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
        {/* Date skeleton */}
        <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        {/* Open link skeleton */}
        <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}
