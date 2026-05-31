import { NextResponse } from 'next/server'
import { readStatsCache, getSessions } from '@/lib/claude-reader'
import { estimateTotalCostFromModel, cacheEfficiency, getPricing } from '@/lib/pricing'
import { projectDisplayName } from '@/lib/decode'
import type { CostAnalytics, ModelCostBreakdown, DailyCost, ProjectCost } from '@/types/claude'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [stats, sessions] = await Promise.all([readStatsCache(), getSessions()])

  // If no sessions at all, return empty
  if (!sessions || sessions.length === 0) {
    return NextResponse.json({
      total_cost: 0, total_savings: 0, models: [], daily: [], by_project: [],
      _note: 'No Claude Code sessions found in ~/.claude/',
    })
  }

  // ── Per-model breakdown ────────────────────────────────────────────────────
  let totalCost = 0
  let totalSavings = 0
  let models: ModelCostBreakdown[] = []

  if (stats?.modelUsage) {
    models = Object.entries(stats.modelUsage).map(([model, usage]) => {
      const cost = estimateTotalCostFromModel(model, usage)
      const eff = cacheEfficiency(model, usage)
      totalCost += cost
      totalSavings += eff.savedUSD
      return {
        model,
        input_tokens: usage.inputTokens ?? 0,
        output_tokens: usage.outputTokens ?? 0,
        cache_write_tokens: usage.cacheCreationInputTokens ?? 0,
        cache_read_tokens: usage.cacheReadInputTokens ?? 0,
        estimated_cost: cost,
        cache_savings: eff.savedUSD ?? 0,
        cache_hit_rate: eff.hitRate ?? 0,
      }
    }).sort((a, b) => b.estimated_cost - a.estimated_cost)
  } else {
    // Fallback: aggregate model usage from session meta
    const modelMap = new Map<string, { input: number; output: number; cacheWrite: number; cacheRead: number }>()
    for (const s of sessions) {
      const models = Object.keys(s.model_usage ?? {})
      const primaryModel = models[0] ?? 'unknown'
      const entry = modelMap.get(primaryModel) ?? { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 }
      entry.input += s.input_tokens ?? 0
      entry.output += s.output_tokens ?? 0
      entry.cacheWrite += s.cache_creation_input_tokens ?? 0
      entry.cacheRead += s.cache_read_input_tokens ?? 0
      modelMap.set(primaryModel, entry)
    }
    models = [...modelMap.entries()].map(([model, usage]) => {
      const cost = estimateTotalCostFromModel(model, {
        inputTokens: usage.input,
        outputTokens: usage.output,
        cacheCreationInputTokens: usage.cacheWrite,
        cacheReadInputTokens: usage.cacheRead,
        costUSD: 0,
        webSearchRequests: 0,
      })
      const eff = cacheEfficiency(model, {
        inputTokens: usage.input,
        outputTokens: usage.output,
        cacheCreationInputTokens: usage.cacheWrite,
        cacheReadInputTokens: usage.cacheRead,
        costUSD: 0,
        webSearchRequests: 0,
      })
      totalCost += cost
      totalSavings += eff.savedUSD
      return {
        model,
        input_tokens: usage.input,
        output_tokens: usage.output,
        cache_write_tokens: usage.cacheWrite,
        cache_read_tokens: usage.cacheRead,
        estimated_cost: cost,
        cache_savings: eff.savedUSD ?? 0,
        cache_hit_rate: eff.hitRate ?? 0,
      }
    }).sort((a, b) => b.estimated_cost - a.estimated_cost)
  }

  // ── Daily cost by model ────────────────────────────────────────────────────
  let daily: DailyCost[] = []

  if (stats?.dailyModelTokens ?? stats?.tokensByDate) {
    const raw = stats.dailyModelTokens ?? stats.tokensByDate ?? []
    daily = raw.map(d => {
      const costs: Record<string, number> = {}
      let dayTotal = 0
      for (const [model, tokens] of Object.entries(d.tokensByModel ?? {})) {
        const p = getPricing(model)
        const cost = tokens * p.input * 0.5 + tokens * p.output * 0.5
        costs[model] = cost
        dayTotal += cost
      }
      return { date: d.date, costs, total: dayTotal }
    })
  } else {
    // Fallback: compute daily cost from sessions
    const dailyMap = new Map<string, number>()
    for (const s of sessions) {
      const date = s.start_time?.slice(0, 10)
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
      const primaryModel = Object.keys(s.model_usage ?? {})[0] ?? 'unknown'
      const cost = estimateTotalCostFromModel(primaryModel, {
        inputTokens: s.input_tokens ?? 0,
        outputTokens: s.output_tokens ?? 0,
        cacheCreationInputTokens: s.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: s.cache_read_input_tokens ?? 0,
        costUSD: 0,
        webSearchRequests: 0,
      })
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + cost)
    }
    daily = [...dailyMap.entries()]
      .map(([date, total]) => ({ date, costs: {} as Record<string, number>, total }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // ── Cost by project ────────────────────────────────────────────────────────
  const projectMap = new Map<string, { cost: number; input: number; output: number }>()
  for (const s of sessions) {
    const pp = s.project_path ?? ''
    const slug = pp
    const existing = projectMap.get(slug) ?? { cost: 0, input: 0, output: 0 }
    const cost = estimateTotalCostFromModel('claude-opus-4-7', {
      inputTokens: s.input_tokens ?? 0,
      outputTokens: s.output_tokens ?? 0,
      cacheCreationInputTokens: s.cache_creation_input_tokens ?? 0,
      cacheReadInputTokens: s.cache_read_input_tokens ?? 0,
      costUSD: 0,
      webSearchRequests: 0,
    })
    projectMap.set(slug, {
      cost: existing.cost + cost,
      input: existing.input + (s.input_tokens ?? 0),
      output: existing.output + (s.output_tokens ?? 0),
    })
  }

  const by_project: ProjectCost[] = [...projectMap.entries()]
    .map(([slug, data]) => {
      const projectPath = slug
      return {
        slug,
        display_name: projectDisplayName(projectPath),
        estimated_cost: data.cost,
        input_tokens: data.input,
        output_tokens: data.output,
      }
    })
    .sort((a, b) => b.estimated_cost - a.estimated_cost)
    .slice(0, 20)

  const result: CostAnalytics = { total_cost: totalCost, total_savings: totalSavings, models, daily, by_project }
  return NextResponse.json(result)
}
