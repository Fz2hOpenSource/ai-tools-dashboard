import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import type { StatsCache, HistoryEntry, ModelUsage } from '@/types/claude'
import type { ProviderInfo, ProviderReader } from './types'

const HOME = process.env.OPENCLAW_HOME ?? path.join(os.homedir(), '.openclaw')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

let _available: boolean | null = null
async function detectAvailable(): Promise<boolean> {
  if (_available !== null) return _available
  try {
    const sessionsDir = path.join(HOME, 'agents', 'main', 'sessions')
    await fs.access(sessionsDir)
    _available = true
  } catch { _available = false }
  return _available
}

// Synchronous fallback for the info object (may be inaccurate until first async check)
function detectAvailableSync(): boolean {
  if (_available !== null) return _available
  // Optimistic: assume available, will be corrected on first async call
  return true
}

export const openclawInfo: ProviderInfo = {
  type: 'openclaw',
  label: 'OpenClaw',
  homeDir: HOME,
  get available() { return _available ?? true }, // lazy, corrected on first check
}

/** Scan session JSONL files and extract metadata */
async function listSessionFiles(): Promise<string[]> {
  const sessionsDir = path.join(HOME, 'agents', 'main', 'sessions')
  try {
    const entries = await fs.readdir(sessionsDir)
    return entries
      .filter(f => f.endsWith('.jsonl') && !f.includes('.checkpoint.'))
      .map(f => path.join(sessionsDir, f))
  } catch { return [] }
}

/** Parse a single OpenClaw session JSONL into a ParsedSession */
async function parseSessionFile(filePath: string): Promise<AnyRecord | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const lines = raw.split(/\r?\n/).filter(l => l.trim())

    // ── Meta from first line (session event) ──
    let sessionMeta: AnyRecord = {}
    let cwd = ''
    let sessionId = ''
    let startTime = ''

    // ── Accumulators ──
    let model = 'unknown'
    let inputTokens = 0
    let outputTokens = 0
    let cacheRead = 0
    let cacheWrite = 0
    let userMsgs = 0
    let assistantMsgs = 0
    const toolCounts: Record<string, number> = {}
    let usesMCP = false
    let firstPrompt = ''
    let lastTimestamp = ''

    for (const line of lines) {
      let obj: AnyRecord
      try { obj = JSON.parse(line) } catch { continue }

      if (obj.type === 'session') {
        sessionMeta = obj
        cwd = obj.cwd ?? ''
        sessionId = obj.id ?? path.basename(filePath, '.jsonl')
        startTime = obj.timestamp ?? ''
        lastTimestamp = obj.timestamp ?? ''
        continue
      }

      if (obj.type === 'model_change') {
        model = obj.modelId ?? obj.provider ?? 'unknown'
        continue
      }

      if (obj.timestamp) lastTimestamp = obj.timestamp

      if (obj.type === 'message' && obj.message) {
        const msg = obj.message
        if (msg.role === 'user') {
          userMsgs++
          if (!firstPrompt && msg.content) {
            const textParts = (Array.isArray(msg.content) ? msg.content : [msg.content])
              .filter((c: AnyRecord) => c.type === 'text')
              .map((c: AnyRecord) => c.text)
            firstPrompt = textParts.join(' ').slice(0, 200)
          }
        } else if (msg.role === 'assistant') {
          assistantMsgs++
          if (msg.usage) {
            inputTokens += msg.usage.input ?? 0
            outputTokens += msg.usage.output ?? 0
            cacheRead += msg.usage.cacheRead ?? 0
            cacheWrite += msg.usage.cacheWrite ?? 0
          }
          // Count tool calls
          if (Array.isArray(msg.content)) {
            for (const part of msg.content) {
              if (part.type === 'toolCall') {
                const toolName = part.name ?? 'unknown'
                toolCounts[toolName] = (toolCounts[toolName] ?? 0) + 1
                if (toolName.startsWith('mcp__')) usesMCP = true
              }
            }
          }
        }
      }
    }

    if (!sessionId) return null

    // Calculate duration
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

    // Build model_usage
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
      input_tokens: inputTokens,
      output_tokens: outputTokens,
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
      // ParsedSession extras
      cwd,
      slug_name: undefined,
      cc_version: undefined,
      git_branch: undefined,
      has_compaction: false,
      has_thinking: false,
      // Provider tag
      _provider: 'openclaw' as const,
    }
  } catch {
    return null
  }
}

export const openclawReader: ProviderReader = {
  info: openclawInfo,

  async getSessions() {
    if (!await detectAvailable()) return []
    const files = await listSessionFiles()
    const results = await Promise.all(files.map(parseSessionFile))
    return results.filter((s): s is AnyRecord => s !== null) as AnyRecord[]
  },

  async getStatsCache(): Promise<StatsCache | null> {
    // OpenClaw doesn't have a stats-cache.json equivalent
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
            if (obj.type === 'session' && obj.timestamp) {
              const ts = new Date(obj.timestamp).getTime()
              if (!isNaN(ts)) {
                entries.push({
                  timestamp: ts,
                  display: 'openclaw session',
                  project: obj.cwd ?? '',
                })
              }
              break
            }
          } catch { continue }
        }
      } catch { continue }
    }
    return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  },

  async getStorageBytes(): Promise<number> {
    if (!await detectAvailable()) return 0
    let total = 0
    const files = await listSessionFiles()
    for (const file of files) {
      try {
        const stat = await fs.stat(file)
        total += stat.size
      } catch { /* */ }
    }
    return total
  },
}
