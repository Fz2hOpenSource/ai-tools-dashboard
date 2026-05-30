'use client'

import { formatCost, formatTokens } from '@/lib/decode'
import type { ModelCostBreakdown } from '@/types/claude'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Database } from 'lucide-react'

interface Props {
  models: ModelCostBreakdown[]
  totalSavings: number
}

export function CacheEfficiencyPanel({ models, totalSavings }: Props) {
  const totalCacheRead = models.reduce((s, m) => s + m.cache_read_tokens, 0)
  const totalInput     = models.reduce((s, m) => s + m.input_tokens, 0)
  const totalContext   = totalInput + totalCacheRead
  const hitRate        = totalContext > 0 ? totalCacheRead / totalContext : 0
  const totalCost      = models.reduce((s, m) => s + m.estimated_cost, 0)
  const wouldHavePaid  = totalCost + totalSavings

  const pieData = [
    { name: 'Cache Read', value: totalCacheRead, color: '#34d399' },
    { name: 'Direct Input', value: totalInput, color: 'var(--viz-sky)' },
  ]

  if (totalContext === 0) {
    return (
      <div className="flex items-center gap-3 py-6 text-muted-foreground/50 text-sm">
        <Database className="w-4 h-4" />
        No cache data recorded yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_140px] gap-6 items-center">
      <div className="space-y-2.5 text-[13px]">
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground/70">Cache hit rate</span>
          <span className="text-[#34d399] font-bold text-xl tabular-nums">
            {(hitRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground/70">Context from cache</span>
          <span className="text-foreground/80 font-mono text-[12px]">{formatTokens(totalCacheRead)}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground/70">Context from input</span>
          <span className="text-foreground/80 font-mono text-[12px]">{formatTokens(totalInput)}</span>
        </div>
        <div className="border-t border-border/40 pt-3 mt-2 space-y-2">
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground/60 text-[12px]">Without cache</span>
            <span className="text-red-400/80 font-mono text-[12px]">{formatCost(wouldHavePaid)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground/60 text-[12px]">You paid</span>
            <span className="text-foreground font-mono text-[12px]">{formatCost(totalCost)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#34d399] font-semibold text-[12px]">Savings</span>
            <span className="text-[#34d399] font-bold font-mono">{formatCost(totalSavings)}</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={32}
            outerRadius={56}
            dataKey="value"
            strokeWidth={0}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            formatter={(val: number | undefined, name?: string) => [formatTokens(val ?? 0), name ?? '']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
