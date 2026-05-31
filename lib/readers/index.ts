import type { HistoryEntry } from '@/types/claude'
import type { ParsedSession } from '@/lib/claude-reader'
import type { ProviderInfo, ProviderReader } from './types'
import { openclawReader } from './openclaw'
import { codexReader } from './codex'

export type { ProviderType, ProviderInfo, ProviderReader } from './types'

const EXTERNAL_READERS: ProviderReader[] = [openclawReader, codexReader]

export function getAvailableProviders(): ProviderInfo[] {
  return EXTERNAL_READERS.filter(r => r.info.available).map(r => r.info)
}

// ── Result cache (5s TTL) — avoids re-parsing on every page navigation ──
let cachedExternalSessions: ParsedSession[] | null = null
let cachedExternalTime = 0
const CACHE_TTL = 60_000 // 1 minute — sessions don't change mid-request

/** Merge sessions from all external readers (OpenClaw, Codex). Cached for 5 seconds. */
export async function getExternalSessions(): Promise<ParsedSession[]> {
  const now = Date.now()
  if (cachedExternalSessions && now - cachedExternalTime < CACHE_TTL) {
    return cachedExternalSessions
  }
  const results = await Promise.all(
    EXTERNAL_READERS.filter(r => r.info.available).map(r => r.getSessions())
  )
  cachedExternalSessions = results.flat()
  cachedExternalTime = now
  return cachedExternalSessions
}

export async function getExternalHistory(limit = 200): Promise<HistoryEntry[]> {
  const results = await Promise.all(
    EXTERNAL_READERS.filter(r => r.info.available).map(r => r.getHistory(limit))
  )
  return results.flat().sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}

export async function getExternalStorageBytes(): Promise<number> {
  const results = await Promise.all(
    EXTERNAL_READERS.filter(r => r.info.available).map(r => r.getStorageBytes())
  )
  return results.reduce((s, n) => s + n, 0)
}
