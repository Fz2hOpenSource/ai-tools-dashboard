'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/components/theme-provider'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  numericValue?: number
  description?: string
  trend?: number
  sparkData?: number[]
  accentColor?: string
}

function resolveChartColor(accentColor: string | undefined, theme: 'light' | 'dark'): string {
  if (!accentColor) return theme === 'light' ? '#d97706' : '#e0780a'
  switch (accentColor) {
    case 'var(--viz-sky)':
      return theme === 'light' ? '#2563eb' : '#60a5fa'
    case 'var(--foreground)':
      return theme === 'light' ? '#1a1d26' : '#e2e6ef'
    default:
      return accentColor
  }
}

const TREND_COLORS = {
  up:   { light: '#059669', dark: '#34d399' },
  down: { light: '#dc2626', dark: '#f87171' },
}

export function StatCard({ title, value, numericValue, description, trend, sparkData, accentColor }: StatCardProps) {
  const { theme } = useTheme()
  const resolvedAccent = resolveChartColor(accentColor, theme)
  const hasTrend = trend !== undefined && !isNaN(trend)
  const isUp = hasTrend && trend! >= 0
  const trendColor = hasTrend ? TREND_COLORS[isUp ? 'up' : 'down'][theme] : undefined

  const rawSpark = sparkData ?? []
  const chartData =
    rawSpark.length === 1
      ? [{ v: rawSpark[0]! }, { v: rawSpark[0]! }]
      : rawSpark.map((v, i) => ({ v, i }))

  return (
    <Card className={cn(
      'group/card relative overflow-hidden gap-3',
    )}>
      <CardHeader className="pb-0 relative z-10">
        <CardDescription className="text-[11px] font-medium tracking-widest uppercase opacity-60">
          {title}
        </CardDescription>
        <div className="flex items-end justify-between mt-1">
          <CardTitle
            className="text-3xl font-bold tabular-nums leading-none tracking-tight"
            style={{ color: resolvedAccent }}
          >
            {numericValue !== undefined ? (
              <AnimatedCounter value={numericValue} className="tabular-nums" />
            ) : (
              value
            )}
          </CardTitle>
          {hasTrend && (
            <Badge
              variant="outline"
              className="gap-1 text-xs font-medium rounded-full px-2 py-0.5"
              style={{
                color: trendColor,
                borderColor: `${trendColor}50`,
                backgroundColor: `${trendColor}10`,
              }}
            >
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend!).toFixed(1)}%
            </Badge>
          )}
        </div>
        {description && (
          <CardDescription className="text-[11px] mt-1.5 opacity-70">{description}</CardDescription>
        )}
      </CardHeader>
      {chartData.length > 0 && (
        <CardContent className="pt-0 pb-4 px-6 relative z-10">
          <ResponsiveContainer width="100%" height={44}>
            <LineChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={resolvedAccent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={resolvedAccent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="v"
                stroke={resolvedAccent}
                strokeWidth={1.5}
                dot={false}
                strokeOpacity={0.8}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  )
}
