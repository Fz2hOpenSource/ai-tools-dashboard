'use client'

import { useState, useEffect } from 'react'
import { Bot, Check, ChevronDown, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ProviderInfo {
  type: string
  label: string
  homeDir: string
  available: boolean
}

interface ProviderStatus {
  providers: ProviderInfo[]
  sessionCounts: Record<string, number>
}

export function ProviderSelector() {
  const [status, setStatus] = useState<ProviderStatus | null>(null)
  const [selected, setSelected] = useState<string>('all')

  useEffect(() => {
    fetch('/api/debug-providers')
      .then(r => r.json())
      .then(data => {
        const providers: ProviderInfo[] = [
          { type: 'claude', label: 'Claude Code', homeDir: '~/.claude', available: true },
        ]
        if (data.openclaw?.available) {
          providers.push({ type: 'openclaw', label: 'OpenClaw', homeDir: '~/.openclaw', available: true })
        }
        if (data.codex?.available) {
          providers.push({ type: 'codex', label: 'Codex', homeDir: '~/.codex', available: true })
        }
        setStatus({
          providers,
          sessionCounts: {
            claude: data.claude?.sessionCount ?? 0,
            openclaw: data.openclaw?.sessionCount ?? 0,
            codex: data.codex?.sessionCount ?? 0,
          },
        })
      })
      .catch(() => {})
  }, [])

  if (!status || status.providers.length <= 1) return null

  const selectedLabel = selected === 'all'
    ? `All (${status.providers.length} tools)`
    : status.providers.find(p => p.type === selected)?.label ?? 'All'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
            'bg-muted/40 border border-border/50 text-muted-foreground',
            'hover:bg-muted hover:text-foreground hover:border-border',
            'transition-all duration-200 cursor-pointer',
          )}
        >
          <Monitor className="w-3 h-3" />
          <span className="hidden sm:inline">{selectedLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-1.5 font-mono text-sm">
        <button
          onClick={() => setSelected('all')}
          className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-left hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <span>All providers</span>
          {selected === 'all' && <Check className="w-3.5 h-3.5 text-primary" />}
        </button>
        <div className="h-px bg-border/50 my-1" />
        {status.providers.map(p => (
          <button
            key={p.type}
            onClick={() => setSelected(p.type)}
            className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-left hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-3 h-3 text-muted-foreground" />
              <span>{p.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/50">
                {status.sessionCounts[p.type] ?? '?'} sessions
              </span>
              {selected === p.type && <Check className="w-3.5 h-3.5 text-primary" />}
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
