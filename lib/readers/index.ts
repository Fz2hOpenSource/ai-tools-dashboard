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

/** Merge sessions from all external readers (OpenClaw, Codex) into the main session list */
export async function getExternalSessions(): Promise<ParsedSession[]> {
  const results = await Promise.all(
    EXTERNAL_READERS.filter(r => r.info.available).map(r => r.getSessions())
  )
  return results.flat()
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
