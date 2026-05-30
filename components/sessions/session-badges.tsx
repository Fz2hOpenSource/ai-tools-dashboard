'use client'

import { Zap, Bot, Plug, Globe, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  has_compaction?: boolean
  uses_task_agent?: boolean
  uses_mcp?: boolean
  uses_web_search?: boolean
  uses_web_fetch?: boolean
  has_thinking?: boolean
}

const badgeConfig = [
  { key: 'compacted',  cond: (p: BadgeProps) => p.has_compaction,                         icon: Zap,   label: 'Compact',  activeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { key: 'agent',      cond: (p: BadgeProps) => p.uses_task_agent,                        icon: Bot,   label: 'Agent',    activeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { key: 'mcp',        cond: (p: BadgeProps) => p.uses_mcp,                               icon: Plug,  label: 'MCP',      activeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { key: 'web',        cond: (p: BadgeProps) => (p.uses_web_search || p.uses_web_fetch),  icon: Globe, label: 'Web',      activeClass: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { key: 'thinking',   cond: (p: BadgeProps) => p.has_thinking,                           icon: Brain, label: 'Thinking', activeClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
]

export function SessionBadges(props: BadgeProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {badgeConfig.map(({ key, cond, icon: Icon, label, activeClass }) =>
        cond(props) ? (
          <span
            key={key}
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors',
              activeClass,
            )}
          >
            <Icon className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </span>
        ) : null
      )}
    </div>
  )
}
