'use client'

import useSWR from 'swr'
import { TopBar } from '@/components/layout/top-bar'
import { CostOverTimeChart } from '@/components/costs/cost-over-time-chart'
import { CostByProjectChart } from '@/components/costs/cost-by-project-chart'
import { ModelTokenTable } from '@/components/costs/model-token-table'
import { CacheEfficiencyPanel } from '@/components/costs/cache-efficiency-panel'
import { formatCost } from '@/lib/decode'
import { PRICING } from '@/lib/pricing'
import type { CostAnalytics } from '@/types/claude'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SkeletonCard, StatSkeletonGrid } from '@/components/ui/skeleton-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, TrendingDown, Banknote } from 'lucide-react'
import { cn } from '@/lib/utils'

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error(`API error ${r.status}`); return r.json() })

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

export default function CostsPage() {
  const { data, error, isLoading } = useSWR<CostAnalytics>('/api/costs', fetcher, { refreshInterval: 30_000 })

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar titleKey="title.costs" subtitle="Estimated spend from ~/.claude/" />
      <div className="p-4 sm:p-6 space-y-6">

        {/* ── Error ── */}
        {error && (
          <div className="border border-destructive/30 rounded-xl p-6 bg-destructive/5">
            <p className="text-sm text-destructive font-mono">✗ {String(error)}</p>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="space-y-4">
            <StatSkeletonGrid count={3} />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} variant="chart" />
            ))}
          </div>
        )}

        {/* ── Data ── */}
        {data && (
          <>
            {/* Hero stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  index: 0,
                  icon: DollarSign,
                  title: 'Total Estimated Cost',
                  value: formatCost(data.total_cost),
                  desc: 'All time spend across all projects',
                  color: 'text-[#d97706]',
                },
                {
                  index: 1,
                  icon: TrendingDown,
                  title: 'Cache Savings',
                  value: formatCost(data.total_savings),
                  desc: 'Saved by prompt caching',
                  color: 'text-[#34d399]',
                },
                {
                  index: 2,
                  icon: Banknote,
                  title: 'Without Cache',
                  value: formatCost(data.total_cost + data.total_savings),
                  desc: 'What you would have spent',
                  color: 'text-red-400',
                },
              ].map(({ index, icon: Icon, title, value, desc, color }) => (
                <Stagger key={title} index={index}>
                  <Card className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase">
                        <Icon className="w-3.5 h-3.5 opacity-50" />
                        {title}
                      </CardDescription>
                      <CardTitle className={cn('text-3xl font-bold tabular-nums tracking-tight', color)}>
                        {value}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[11px] text-muted-foreground/60">{desc}</p>
                    </CardContent>
                  </Card>
                </Stagger>
              ))}

            </div>

            {/* Cost over time */}
            {data.daily.length > 0 && (
              <Stagger index={3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Cost Over Time</CardTitle>
                    <CardDescription className="text-xs mt-1">Daily estimated spend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CostOverTimeChart daily={data.daily} />
                  </CardContent>
                </Card>
              </Stagger>
            )}

            {/* Cost by project */}
            {data.by_project.length > 0 && (
              <Stagger index={4}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Cost by Project</CardTitle>
                    <CardDescription className="text-xs mt-1">Spend breakdown across projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CostByProjectChart projects={data.by_project} />
                  </CardContent>
                </Card>
              </Stagger>
            )}

            {/* Per-model table */}
            <Stagger index={5}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Per-Model Token Breakdown</CardTitle>
                  <CardDescription className="text-xs mt-1">Token usage and cost by model</CardDescription>
                </CardHeader>
                <CardContent>
                  <ModelTokenTable models={data.models} />
                </CardContent>
              </Card>
            </Stagger>

            {/* Cache efficiency */}
            <Stagger index={6}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Cache Efficiency</CardTitle>
                  <CardDescription className="text-xs mt-1">How much caching is saving you</CardDescription>
                </CardHeader>
                <CardContent>
                  <CacheEfficiencyPanel models={data.models} totalSavings={data.total_savings} />
                </CardContent>
              </Card>
            </Stagger>

            {/* Pricing reference */}
            <Stagger index={7}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Pricing Reference</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Estimates only — override in{' '}
                    <code className="text-[11px] bg-muted/50 px-1.5 py-0.5 rounded font-mono">~/.cc-lens/pricing.json</code>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/40">
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Model</TableHead>
                          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Input /MTok</TableHead>
                          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Output /MTok</TableHead>
                          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Cache W /MTok</TableHead>
                          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Cache R /MTok</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(PRICING).map(([model, p]) => (
                          <TableRow key={model} className="border-border/30 hover:bg-muted/30">
                            <TableCell className="font-mono text-[12px] text-foreground/80">{model}</TableCell>
                            <TableCell className="text-right font-mono text-[12px] text-blue-600 dark:text-[#60a5fa]">${(p.input * 1_000_000).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono text-[12px] text-[#d97706]">${(p.output * 1_000_000).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono text-[12px] text-[#a78bfa]">${(p.cacheWrite * 1_000_000).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono text-[12px] text-[#34d399]">${(p.cacheRead * 1_000_000).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </Stagger>
          </>
        )}
      </div>
    </div>
  )
}
