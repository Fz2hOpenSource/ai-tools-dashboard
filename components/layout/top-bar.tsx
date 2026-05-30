'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { mutate } from 'swr'
import { Search, RefreshCw, Menu, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/layout/sidebar-context'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  subtitle?: string
  className?: string
}

function formatTimestamp(d: Date) {
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export function TopBar({ title, subtitle, className }: TopBarProps) {
  const router = useRouter()
  const { setMobileOpen } = useSidebar()
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState<string>('')

  useEffect(() => {
    setNow(formatTimestamp(new Date()))
    const interval = window.setInterval(() => setNow(formatTimestamp(new Date())), 1000)
    return () => window.clearInterval(interval)
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await mutate(() => true, undefined, { revalidate: true })
    router.refresh()
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between gap-4 py-3 px-4 md:px-6',
        'border-b border-border/60',
        'bg-background/80 backdrop-blur-xl',
        'supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      {/* Left: title + subtitle */}
      <div className="min-w-0 flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="md:hidden -ml-1"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4 text-muted-foreground" />
        </Button>

        <div>
          <h1 className="text-base font-semibold text-foreground truncate tracking-tight">{title}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {subtitle && <span className="truncate max-w-[200px] sm:max-w-sm">{subtitle}</span>}
            {now && (
              <span className="inline-flex items-center gap-1 text-muted-foreground/60 font-mono tabular-nums">
                <Clock className="w-3 h-3" />
                {now}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search — desktop */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
          className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="w-3.5 h-3.5 opacity-50" />
          <span className="text-xs">Search</span>
          <kbd className="ml-1 px-1.5 py-0.5 text-[10px] text-muted-foreground/40 rounded font-sans bg-muted/50">⌘K</kbd>
        </Button>

        {/* Search — mobile */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
          className="md:hidden"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
        </Button>

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2 transition-all duration-200"
          aria-label="Refresh data"
        >
          <RefreshCw className={cn('w-3.5 h-3.5 transition-all', refreshing && 'animate-spin text-primary')} />
          <span className="hidden sm:inline text-xs">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
        </Button>
      </div>
    </header>
  )
}
