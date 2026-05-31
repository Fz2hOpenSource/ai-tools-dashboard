import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import type { StatsCache, HistoryEntry, ModelUsage } from '@/types/claude'
import type { ProviderInfo, ProviderReader } from './types'

const HOME = process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

let _available: boolean | null = null
async function detectAvailable(): Promise<boolean> {
  if (_available !== null) return _available
  try {
    await fs.access(path.join(HOME, 'sessions'))
    _available = true
  } catch { _available = false }
  return _available
}

export const codexInfo: ProviderInfo = {
  type: 'codex',
  label: 'Codex',
  homeDir: HOME,
  get available() { return _available ?? true },
}

/** Recursively find all rollout-*.jsonl files */
async function listSessionFiles(): Promise<string[]> {
  const sessionsDir = path.join(HOME, 'sessions')
  const results: string[] = []
  try {
    async function walk(dir: string) {
      let entries: string[]
      try { entries = await fs.readdir(dir) } catch { return }
      for (const name of entries) {
        const full = path.join(dir, name)
        try {
          const stat = await fs.stat(full)
          if (stat.isDirectory()) {
            await walk(full)
          } else if (name.startsWith('rollout-') && name.endsWith('.jsonl')) {
            results.push(full)
          }
        } catch { /* skip unreadable */ }
      }
    }
    await walk(sessionsDir)
  } catch { /* */ }
  return results
}

/** Parse a single Codex rollout JSONL into a ParsedSession */
async function parseSessionFile(filePath: string): Promise<AnyRecord | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const lines = raw.split(/\r?\n/).filter(l => l.trim())

    let sessionId = ''
    let cwd = ''
    let model = 'unknown'
    let startTime = ''
    let lastTimestamp = ''
    let inputTokens = 0
    let outputTokens = 0
    let cacheRead = 0
    let cacheWrite = 0
    let userMsgs = 0
    let assistantMsgs = 0
    const toolCounts: Record<string, number> = {}
    let usesMCP = false
    let firstPrompt = ''
    let prevInputTokens = 0
    let prevOutputTokens = 0

    for (const line of lines) {
      let outer: AnyRecord
      try { outer = JSON.parse(line) } catch { continue }
      if (outer.timestamp && !startTime) startTime = outer.timestamp
      if (outer.timestamp) lastTimestamp = outer.timestamp

      const item = outer.item
      if (!item) continue

      const itemType = item.$rollout_item_type

      if (itemType === 'SessionMeta') {
        sessionId = item.id ?? path.basename(filePath, '.jsonl').replace('rollout-', '')
        cwd = item.cwd ?? ''
        model = item.model_provider ?? item.model ?? 'unknown'
        continue
      }

      if (itemType === 'TurnContext') {
        model = item.model ?? model
        continue
      }

      if (itemType === 'EventMsg') {
        if (item.UserMessage) {
          userMsgs++
          const text = item.UserMessage.content ?? item.UserMessage.text ?? ''
          if (!firstPrompt && text) firstPrompt = String(text).slice(0, 200)
        } else if (item.AgentMessage) {
          assistantMsgs++
        } else if (item.TokenCount) {
          // TokenCount stores cumulative values
          const currInput = item.TokenCount.input_tokens ?? 0
          const currOutput = item.TokenCount.output_tokens ?? 0
          const currCacheRead = item.TokenCount.cache_read_input_tokens ?? 0
          const currCacheWrite = item.TokenCount.cache_creation_input_tokens ?? 0
          // Take max (in case values get reset, use increment instead)
          inputTokens = Math.max(inputTokens, currInput)
          outputTokens = Math.max(outputTokens, currOutput)
          cacheRead = Math.max(cacheRead, currCacheRead)
          cacheWrite = Math.max(cacheWrite, currCacheWrite)
        }
        continue
      }

      if (itemType === 'ResponseItem') {
        if (item.role === 'assistant' && item.content) {
          // Count tool calls
          const content = Array.isArray(item.content) ? item.content : [item.content]
          for (const part of content) {
            if (part.type === 'function_call' || part.type === 'tool_use') {
              const toolName = part.name ?? part.function?.name ?? 'unknown'
              toolCounts[toolName] = (toolCounts[toolName] ?? 0) + 1
              if (toolName.startsWith('mcp__')) usesMCP = true
            }
          }
        }
        continue
      }
    }

    if (!sessionId) return null

    let durationMinutes = 0
    if (startTime && lastTimestamp) {
      try {
        const start = new Date(startTime).getTime()
        const end = new Date(lastTimestamp).getTime()
        if (!isNaN(start) && !isNaN(end) && end > start) {
          durationMinutes = Math.round((end - start) / 60000)
        }
      } catch { /* */ }
    }

    const modelUsage: Record<string, ModelUsage> = {}
    if (model && (inputTokens > 0 || outputTokens > 0)) {
      modelUsage[model] = {
        inputTokens,
        outputTokens,
        cacheCreationInputTokens: cacheWrite,
        cacheReadInputTokens: cacheRead,
        costUSD: 0,
        webSearchRequests: 0,
      }
    }

    const activeInput = inputTokens - prevInputTokens
    const activeOutput = outputTokens - prevOutputTokens

    return {
      session_id: sessionId,
      project_path: cwd || 'unknown',
      start_time: startTime || new Date().toISOString(),
      last_activity: lastTimestamp || undefined,
      duration_minutes: durationMinutes,
      user_message_count: userMsgs,
      assistant_message_count: assistantMsgs,
      tool_counts: toolCounts,
      languages: {},
      git_commits: 0,
      git_pushes: 0,
      input_tokens: activeInput > 0 ? activeInput : inputTokens,
      output_tokens: activeOutput > 0 ? activeOutput : outputTokens,
      cache_creation_input_tokens: cacheWrite,
      cache_read_input_tokens: cacheRead,
      first_prompt: firstPrompt,
      user_interruptions: 0,
      user_response_times: [],
      tool_errors: 0,
      tool_error_categories: {},
      uses_task_agent: false,
      uses_mcp: usesMCP,
      uses_web_search: false,
      uses_web_fetch: false,
      lines_added: 0,
      lines_removed: 0,
      files_modified: 0,
      message_hours: [],
      user_message_timestamps: [],
      model_usage: modelUsage,
      cwd,
      slug_name: undefined,
      cc_version: undefined,
      git_branch: undefined,
      has_compaction: false,
      has_thinking: false,
      _provider: 'codex' as const,
    }
  } catch {
    return null
  }
}

export const codexReader: ProviderReader = {
  info: codexInfo,

  async getSessions() {
    if (!await detectAvailable()) return []
    const files = await listSessionFiles()
    const results = await Promise.all(files.map(parseSessionFile))
    return results.filter((s): s is AnyRecord => s !== null) as AnyRecord[]
  },

  async getStatsCache(): Promise<StatsCache | null> {
    return null
  },

  async getHistory(limit = 200): Promise<HistoryEntry[]> {
    if (!await detectAvailable()) return []
    const files = await listSessionFiles()
    const entries: HistoryEntry[] = []
    for (const file of files.slice(0, limit)) {
      try {
        const raw = await fs.readFile(file, 'utf-8')
        const lines = raw.split(/\r?\n/).filter(l => l.trim())
        for (const line of lines.slice(0, 3)) {
          try {
            const obj = JSON.parse(line)
            if (obj.timestamp) {
              const ts = new Date(obj.timestamp).getTime()
              if (!isNaN(ts)) {
                entries.push({
                  timestamp: ts,
                  display: 'codex session',
                  project: obj.cwd ?? '',
                })
                break
              }
            }
          } catch { continue }
        }
      } catch { continue }
    }
    return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  },

  async getStorageBytes(): Promise<number> {
    if (!detectAvailable()) return 0
    let total = 0
    const files = await listSessionFiles()
    for (const file of files) {
      try { total += (await fs.stat(file)).size } catch { /* */ }
    }
    return total
  },
}
