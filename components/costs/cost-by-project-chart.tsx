'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ResponsiveContainer } from 'recharts'
import { formatCost } from '@/lib/decode'
import type { ProjectCost } from '@/types/claude'

interface Props {
  projects: ProjectCost[]
}

export function CostByProjectChart({ projects }: Props) {
  const top = projects.slice(0, 12)
  if (top.length === 0) {
    return <p className="text-sm text-muted-foreground/50 py-4">No project cost data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, top.length * 28)}>
      <BarChart data={top} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.4} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `$${v.toFixed(2)}`}
        />
        <YAxis
          type="category"
          dataKey="display_name"
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          formatter={(val: number | undefined) => [formatCost(val ?? 0), 'Estimated cost']}
        />
        <Bar dataKey="estimated_cost" radius={[0, 4, 4, 0]}>
          {top.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#d97706' : `#d97706${Math.floor(20 + (12 - i) * 6).toString(16).padStart(2, '0')}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
