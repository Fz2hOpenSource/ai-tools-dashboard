'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { BarChart3, PieChart, Clock, CalendarDays } from 'lucide-react'
import { UsageOverTimeChart } from '@/components/overview/usage-over-time-chart'
import { ModelBreakdownDonut } from '@/components/overview/model-breakdown-donut'
import { ProjectActivityDonut } from '@/components/overview/project-activity-donut'
import { PeakHoursChart } from '@/components/overview/peak-hours-chart'
import { OverviewConversationTable } from '@/components/overview/conversation-table'
import { StatCard } from '@/components/overview/stat-card'
import { formatTokens, formatBytes } from '@/lib/decode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import type { StatsCache, DailyActivity, DailyTokens } from '@/types/claude'
import type { SessionWithFacet, ProjectSummary } from '@/types/claude'
import { format, subDays } from 'date-fns'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse {
  stats: StatsCache
  computed: {
    totalCost: number
    totalCacheSavings: number
    totalTokens: number
    totalInputTokens: number
    totalOutputTokens: number
    totalCacheReadTokens: number
    totalCacheWriteTokens: number
    totalToolCalls: number
    activeDays: number
    avgSessionMinutes: number
    sessionsThisMonth: number
    sessionsThisWeek: number
    storageBytes: number
    sessionCount: number
  }
}

type DatePreset = '7d' | '30d' | '90d'
type CustomRange = { from?: Date; to?: Date }

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`API error ${r.status}`)
    return r.json()
  })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeTrend(
  dailyActivity: DailyActivity[],
  field: 'messageCount' | 'sessionCount',
  days = 7,
): number | undefined {
  const sorted = [...dailyActivity].sort((a, b) => a.date.localeCompare(b.date))
  const recent = sorted.slice(-days)
  const previous = sorted.slice(-(days * 2), -days)
  if (!recent.length || !previous.length) return undefined
  const recentSum = recent.reduce((s, d) => s + (d[field] ?? 0), 0)
  const prevSum = previous.reduce((s, d) => s + (d[field] ?? 0), 0)
  if (prevSum === 0) return undefined
  return ((recentSum - prevSum) / prevSum) * 100
}

function getActivitySpark(dailyActivity: DailyActivity[], field: 'messageCount' | 'sessionCount', days = 14): number[] {
  return [...dailyActivity]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days)
    .map(d => d[field] ?? 0)
}

function getTokenSpark(tokensByDate: DailyTokens[], days = 14): number[] {
  return [...tokensByDate]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days)
    .map(d => Object.values(d.tokensByModel ?? {}).reduce((s, v) => s + v, 0))
}

// ─── Stagger animation helper ─────────────────────────────────────────────────

function Stagger({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${0.05 + index * 0.06}s`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OverviewClient() {
  const { theme } = useTheme()
  const [datePreset, setDatePreset] = useState<DatePreset>('30d')
  const [customRange, setCustomRange] = useState<CustomRange>({})
  const [pickerOpen, setPickerOpen] = useState(false)

  const { data, error, isLoading } = useSWR<ApiResponse>('/api/stats', fetcher, {
    refreshInterval: 30_000,
  })
  const { data: sessionsData } = useSWR<{ sessions: SessionWithFacet[] }>('/api/sessions', fetcher, {
    refreshInterval: 30_000,
  })
  const { data: projectsData } = useSWR<{ projects: ProjectSummary[] }>('/api/projects', fetcher, {
    refreshInterval: 30_000,
  })

  const sessions = sessionsData?.sessions ?? []
  const projects = projectsData?.projects ?? []
  const projectCount = projects.length

  const usingCustom = !!(customRange.from && customRange.to)
  const chartDays = usingCustom
    ? Math.ceil((customRange.to!.getTime() - customRange.from!.getTime()) / (24 * 60 * 60 * 1000))
    : datePreset === '7d' ? 7 : datePreset === '30d' ? 30 : 90
  const effectiveDateFrom = usingCustom
    ? format(customRange.from!, 'MM/dd/yyyy')
    : format(subDays(new Date(), chartDays), 'MM/dd/yyyy')
  const effectiveDateTo = usingCustom
    ? format(customRange.to!, 'MM/dd/yyyy')
    : format(new Date(), 'MM/dd/yyyy')

  const pickerLabel = usingCustom
    ? `${format(customRange.from!, 'MMM d')} – ${format(customRange.to!, 'MMM d, yyyy')}`
    : 'Pick a date'

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading || !data || !data.computed) {
    return (
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32 bg-muted/50 rounded-lg" />
            <Skeleton className="h-4 w-56 bg-muted/30 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-48 bg-muted/50 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-muted/30" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Skeleton className="h-72 rounded-xl bg-muted/30" />
          <Skeleton className="h-72 rounded-xl bg-muted/30" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-6">
        <div className="border border-destructive/30 rounded-xl p-6 bg-destructive/5">
          <p className="text-sm text-destructive font-mono">
            ✗ error loading data: {String(error)}
          </p>
        </div>
      </div>
    )
  }

  const { stats, computed } = data

  const inputBlue = theme === 'light' ? '#2563eb' : '#60a5fa'
  const tokenSegs = [
    { label: 'input',       value: computed.totalInputTokens,      color: inputBlue },
    { label: 'output',      value: computed.totalOutputTokens,     color: '#d97706' },
    { label: 'cache read',  value: computed.totalCacheReadTokens,  color: '#34d399' },
    { label: 'cache write', value: computed.totalCacheWriteTokens, color: '#a78bfa' },
  ]
  const totalTokens =
    computed.totalInputTokens +
    computed.totalOutputTokens +
    computed.totalCacheReadTokens +
    computed.totalCacheWriteTokens

  const tokensByDate = stats.dailyModelTokens ?? stats.tokensByDate ?? []
  const trendWindow = Math.min(Math.max(chartDays, 7), 30)

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6 bg-background">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <Stagger index={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5 font-mono">
              <span className="text-primary/70">{projectCount}</span> projects{' '}
              <span className="text-muted-foreground/30">·</span>{' '}
              {formatBytes(computed.storageBytes)} stored
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              value={usingCustom ? '' : datePreset}
              onValueChange={v => {
                setDatePreset(v as DatePreset)
                setCustomRange({})
              }}
            >
              <TabsList className="bg-muted/50">
                <TabsTrigger value="7d" className="text-xs">7d</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs">30d</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs">90d</TabsTrigger>
              </TabsList>
            </Tabs>

            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={usingCustom ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2 text-xs"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  {pickerLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: customRange.from, to: customRange.to }}
                  onSelect={range => {
                    setCustomRange({ from: range?.from, to: range?.to })
                    if (range?.from && range?.to) setPickerOpen(false)
                  }}
                  disabled={{ after: new Date() }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Stagger>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Sessions',
            value: computed.sessionCount.toLocaleString(),
            description: `${computed.sessionsThisMonth} this month · ${computed.sessionsThisWeek} this week`,
            trend: computeTrend(stats.dailyActivity, 'sessionCount', trendWindow),
            spark: getActivitySpark(stats.dailyActivity, 'sessionCount'),
            accent: 'var(--foreground)',
            index: 1,
          },
          {
            title: 'Messages',
            value: stats.totalMessages.toLocaleString(),
            description: `${computed.activeDays} active days`,
            trend: computeTrend(stats.dailyActivity, 'messageCount', trendWindow),
            spark: getActivitySpark(stats.dailyActivity, 'messageCount'),
            accent: '#d97706',
            index: 2,
          },
          {
            title: 'Tokens Used',
            value: formatTokens(computed.totalTokens),
            description: `${formatTokens(computed.totalCacheReadTokens)} from cache`,
            spark: getTokenSpark(tokensByDate),
            accent: inputBlue,
            index: 3,
          },
          {
            title: 'Est. Cost',
            value: `$${computed.totalCost.toFixed(2)}`,
            description: `$${computed.totalCacheSavings.toFixed(2)} saved via cache`,
            spark: getTokenSpark(tokensByDate),
            accent: '#34d399',
            index: 4,
          },
        ].map(card => (
          <Stagger key={card.title} index={card.index}>
            <StatCard
              title={card.title}
              value={card.value}
              description={card.description}
              trend={card.trend}
              sparkData={card.spark}
              accentColor={card.accent}
            />
          </Stagger>
        ))}
      </div>

      {/* ── Main charts row ───────────────────────────────────────────────── */}
      <Stagger index={5}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Usage Over Time</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Messages and sessions — last {chartDays} days
                  </CardDescription>
                </div>
                <BarChart3 className="w-4 h-4 text-muted-foreground/40 mt-0.5" />
              </div>
            </CardHeader>
            <CardContent>
              <UsageOverTimeChart
                data={stats.dailyActivity}
                days={chartDays}
                dateFrom={effectiveDateFrom}
                dateTo={effectiveDateTo}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Model Distribution</CardTitle>
                  <CardDescription className="text-xs mt-1">Token usage by model</CardDescription>
                </div>
                <PieChart className="w-4 h-4 text-muted-foreground/40 mt-0.5" />
              </div>
            </CardHeader>
            <CardContent>
              <ModelBreakdownDonut modelUsage={stats.modelUsage} />
            </CardContent>
          </Card>
        </div>
      </Stagger>

      {/* ── Secondary charts row ──────────────────────────────────────────── */}
      <Stagger index={6}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Peak Hours</CardTitle>
                  <CardDescription className="text-xs mt-1">Activity by hour of day</CardDescription>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground/40 mt-0.5" />
              </div>
            </CardHeader>
            <CardContent>
              <PeakHoursChart hourCounts={stats.hourCounts ?? {}} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Project Activity</CardTitle>
                  <CardDescription className="text-xs mt-1">Distribution across projects</CardDescription>
                </div>
                <PieChart className="w-4 h-4 text-muted-foreground/40 mt-0.5" />
              </div>
            </CardHeader>
            <CardContent>
              <ProjectActivityDonut projects={projects} />
            </CardContent>
          </Card>
        </div>
      </Stagger>

      {/* ── Token breakdown ───────────────────────────────────────────────── */}
      <Stagger index={7}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Token Breakdown</CardTitle>
            <CardDescription className="text-xs mt-1">All-time token type distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalTokens > 0 ? (
              <>
                <div className="flex h-2 rounded-full overflow-hidden w-full bg-muted/50 ring-1 ring-inset ring-border/30">
                  {tokenSegs.map(({ label, value, color }) => (
                    <div
                      key={label}
                      title={`${label}: ${formatTokens(value)}`}
                      style={{
                        width: `${(value / totalTokens) * 100}%`,
                        minWidth: value > 0 ? 3 : 0,
                        backgroundColor: color,
                      }}
                      className="transition-all duration-500"
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {tokenSegs.map(({ label, value, color }) => (
                    <span key={label} className="inline-flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                      />
                      <span className="text-[11px] text-muted-foreground/70 uppercase tracking-wider">{label}</span>
                      <span className="text-[13px] font-bold tabular-nums font-mono" style={{ color }}>
                        {formatTokens(value)}
                      </span>
                      <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                        {Math.round((value / totalTokens) * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground/50 font-mono">No token usage recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </Stagger>

      {/* ── Recent sessions ───────────────────────────────────────────────── */}
      <Stagger index={8}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
            <CardDescription className="text-xs mt-1">Latest Claude Code conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewConversationTable sessions={sessions} />
          </CardContent>
        </Card>
      </Stagger>

    </div>
  )
}
