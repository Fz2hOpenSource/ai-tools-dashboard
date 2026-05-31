import type { StatsCache, HistoryEntry } from '@/types/claude'

export type ProviderType = 'claude' | 'openclaw' | 'codex'

export interface ProviderInfo {
  type: ProviderType
  label: string
  homeDir: string
  available: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ProviderReader {
  info: ProviderInfo
  getSessions(): Promise<any[]>
  getStatsCache(): Promise<StatsCache | null>
  getHistory(limit?: number): Promise<HistoryEntry[]>
  getStorageBytes(): Promise<number>
}
