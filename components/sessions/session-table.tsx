'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SessionBadges } from './session-badges'
import { Search, Zap, Bot, Plug } from 'lucide-react'
import { formatCost, formatDuration, formatDate, projectDisplayName } from '@/lib/decode'
import { cn } from '@/lib/utils'
import type { SessionWithFacet } from '@/types/claude'

const PAGE_SIZE = 25

type SortKey = 'start_time' | 'duration_minutes' | 'total_messages' | 'estimated_cost' | 'tool_calls'
type SortDir = 'asc' | 'desc'

interface Props {
  sessions: SessionWithFacet[]
}

function SortHeader({
  label, k, sortKey, sortDir, onSort,
}: {
  label: string
  k: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = sortKey === k
  return (
    <button
      onClick={() => onSort(k)}
      className={cn(
        'text-left text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap transition-colors',
        active ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground',
      )}
    >
      {label}{active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
    </button>
  )
}

export function SessionTable({ sessions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('start_time')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [filterCompacted, setFilterCompacted] = useState(false)
  const [filterAgent, setFilterAgent] = useState(false)
  const [filterMcp, setFilterMcp] = useState(false)
  const [search, setSearch] = useState('')
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])
  const router = useRouter()

  const filtered = useMemo(() => {
    let s = sessions
    if (filterCompacted) s = s.filter(x => x.has_compaction)
    if (filterAgent)     s = s.filter(x => x.uses_task_agent)
    if (filterMcp)       s = s.filter(x => x.uses_mcp)
    if (search) {
      const q = search.toLowerCase()
      s = s.filter(x =>
        x.project_path?.toLowerCase().includes(q) ||
        x.first_prompt?.toLowerCase().includes(q) ||
        x.slug?.toLowerCase().includes(q)
      )
    }
    return s
  }, [sessions, filterCompacted, filterAgent, filterMcp, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: number, bv: number
      if (sortKey === 'start_time') {
        av = new Date(a.start_time).getTime()
        bv = new Date(b.start_time).getTime()
      } else if (sortKey === 'total_messages') {
        av = (a.user_message_count ?? 0) + (a.assistant_message_count ?? 0)
        bv = (b.user_message_count ?? 0) + (b.assistant_message_count ?? 0)
      } else if (sortKey === 'tool_calls') {
        av = Object.values(a.tool_counts ?? {}).reduce((s, c) => s + c, 0)
        bv = Object.values(b.tool_counts ?? {}).reduce((s, c) => s + c, 0)
      } else {
        av = (a[sortKey] as number) ?? 0
        bv = (b[sortKey] as number) ?? 0
      }
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // j/k keyboard navigation
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const el = document.activeElement
      const tag = el?.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (el as HTMLElement)?.isContentEditable) return
      if (e.key === 'j') {
        e.preventDefault()
        setFocusedIdx(i => {
          const next = i === null ? 0 : Math.min(i + 1, paginated.length - 1)
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
      } else if (e.key === 'k') {
        e.preventDefault()
        setFocusedIdx(i => {
          const next = i === null ? 0 : Math.max(i - 1, 0)
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
      } else if (e.key === 'Enter' && focusedIdx !== null) {
        const s = paginated[focusedIdx]
        if (s) router.push(`/sessions/${s.session_id}`)
      } else if (e.key === 'Escape' && focusedIdx !== null) {
        setFocusedIdx(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focusedIdx, paginated, router])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
    setFocusedIdx(null)
  }

  const FilterPill = ({ active, onToggle, icon, label }: { active: boolean; onToggle: () => void; icon: React.ReactNode; label: string }) => (
    <button
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 border',
        active
          ? 'bg-primary/10 border-primary/30 text-primary'
          : 'bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:border-border hover:text-muted-foreground/80',
      )}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); setFocusedIdx(null) }}
            className="bg-muted/50 border border-border/60 rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:bg-muted transition-colors w-52"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <FilterPill active={filterCompacted} onToggle={() => { setFilterCompacted(v => !v); setPage(1); setFocusedIdx(null) }} icon={<Zap className="w-3 h-3" />} label="Compact" />
          <FilterPill active={filterAgent}     onToggle={() => { setFilterAgent(v => !v); setPage(1); setFocusedIdx(null) }}     icon={<Bot className="w-3 h-3" />} label="Agent" />
          <FilterPill active={filterMcp}       onToggle={() => { setFilterMcp(v => !v); setPage(1); setFocusedIdx(null) }}       icon={<Plug className="w-3 h-3" />} label="MCP" />
        </div>
        <span className="ml-auto text-[12px] text-muted-foreground/50 font-mono tabular-nums">
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-2.5 text-left"><SortHeader label="Date" k="start_time" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th className="px-4 py-2.5 text-left"><span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Project</span></th>
                <th className="px-4 py-2.5 text-right"><SortHeader label="Dur" k="duration_minutes" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th className="px-4 py-2.5 text-right"><SortHeader label="Msgs" k="total_messages" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th className="px-4 py-2.5 text-right"><SortHeader label="Tools" k="tool_calls" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th className="px-4 py-2.5 text-right"><SortHeader label="Cost" k="estimated_cost" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th className="px-4 py-2.5 text-left min-w-[120px]"><span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Flags</span></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, i) => {
                const totalMsgs = (s.user_message_count ?? 0) + (s.assistant_message_count ?? 0)
                const totalTools = Object.values(s.tool_counts ?? {}).reduce((sum, c) => sum + c, 0)
                const projectName = projectDisplayName(s.project_path ?? '')

                return (
                  <tr
                    key={s.session_id}
                    ref={el => { rowRefs.current[i] = el }}
                    className={cn(
                      'border-b border-border/30 transition-colors group cursor-pointer',
                      i === focusedIdx && 'bg-primary/10 ring-1 ring-inset ring-primary/30',
                    )}
                    onClick={() => router.push(`/sessions/${s.session_id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-muted-foreground whitespace-nowrap text-[12px]">
                      {formatDate(s.start_time)}
                    </td>
                    <td className="px-4 py-2.5 max-w-[220px]">
                      <p className="text-foreground/90 font-medium truncate group-hover:text-primary transition-colors">
                        {projectName}
                      </p>
                      {s.first_prompt && (
                        <p className="text-muted-foreground/40 truncate text-[11px] mt-0.5 leading-tight">
                          {s.first_prompt.slice(0, 60)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground/70 whitespace-nowrap text-[12px]">
                      {formatDuration(s.duration_minutes ?? 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground/70 text-[12px]">
                      {totalMsgs.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground/70 text-[12px]">
                      {totalTools.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-primary font-semibold text-[12px]">
                      {formatCost(s.estimated_cost)}
                    </td>
                    <td className="px-4 py-2.5">
                      <SessionBadges
                        has_compaction={s.has_compaction}
                        uses_task_agent={s.uses_task_agent}
                        uses_mcp={s.uses_mcp}
                        uses_web_search={s.uses_web_search}
                        uses_web_fetch={s.uses_web_fetch}
                        has_thinking={s.has_thinking}
                      />
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground/30 text-[13px]">
                    No sessions match filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground/50 text-[12px]">
            Page {page} / {totalPages} · {sorted.length} sessions
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); setFocusedIdx(null) }}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg border border-border/50 text-muted-foreground/50 hover:text-foreground hover:border-border disabled:opacity-20 disabled:cursor-not-allowed transition-all text-[12px]"
            >
              ←
            </button>
            {(() => {
              const maxVisible = Math.min(5, totalPages)
              const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisible + 1))
              const numPages = Math.min(maxVisible, totalPages - startPage + 1)
              const pages = Array.from({ length: numPages }, (_, i) => startPage + i)
              return pages.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); setFocusedIdx(null) }}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg border transition-all text-[12px]',
                    p === page
                      ? 'border-primary/50 bg-primary/5 text-primary font-semibold'
                      : 'border-border/50 text-muted-foreground/50 hover:text-foreground hover:border-border',
                  )}
                >
                  {p}
                </button>
              ))
            })()}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); setFocusedIdx(null) }}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-border/50 text-muted-foreground/50 hover:text-foreground hover:border-border disabled:opacity-20 disabled:cursor-not-allowed transition-all text-[12px]"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
