'use client'

import { MoreHorizontal } from 'lucide-react'

export function ResourceSkeleton() {
  return (
    <div className="app-panel p-4 space-y-4 animate-pulse border border-zinc-200/60 dark:border-zinc-800/60">
      {/* Card Header Chips */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tag Chip */}
          <div className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          {/* Index Status Chip */}
          <div className="h-6 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          {/* Visibility Chip */}
          <div className="flex h-6 w-16 items-center gap-1 rounded-full bg-zinc-200 px-2 dark:bg-zinc-800" />
        </div>
        
        {/* Actions Button Skeleton */}
        <div className="rounded-lg p-2 text-zinc-200 dark:text-zinc-800">
          <MoreHorizontal className="h-5 w-5 opacity-40" />
        </div>
      </div>

      {/* Resource Title */}
      <div className="space-y-2">
        <div className="h-5 w-11/12 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Note Content */}
      <div className="space-y-1.5 pt-1">
        <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-4 w-5/6 rounded bg-zinc-100 dark:bg-zinc-900" />
      </div>

      {/* Collection Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800/80">
        {/* Date skeleton */}
        <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
        {/* Open link skeleton */}
        <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  )
}
