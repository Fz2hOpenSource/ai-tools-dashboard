'use client'

import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
  /** "stat" | "chart" | "table" | "list" */
  variant?: 'stat' | 'chart' | 'table' | 'list'
}

export function SkeletonCard({ className, variant = 'stat' }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden animate-pulse',
        className,
      )}
    >
      {variant === 'stat' && (
        <div className="p-5 space-y-3">
          <div className="h-3 w-16 rounded bg-muted/60" />
          <div className="h-8 w-28 rounded bg-muted/50" />
          <div className="h-4 w-20 rounded bg-muted/40" />
        </div>
      )}
      {variant === 'chart' && (
        <div className="p-5 space-y-4">
          <div className="h-3 w-24 rounded bg-muted/60" />
          <div className="h-48 w-full rounded-lg bg-muted/30" />
        </div>
      )}
      {variant === 'table' && (
        <div className="p-4 space-y-3">
          <div className="h-8 w-full rounded bg-muted/40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 w-full rounded bg-muted/30" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}
      {variant === 'list' && (
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted/50 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-2/3 rounded bg-muted/50" />
                <div className="h-2.5 w-1/3 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Grid of skeleton stat cards */
export function StatSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant="stat" />
      ))}
    </div>
  )
}
