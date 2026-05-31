import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { clearSessionCache } from '@/lib/claude-reader'

export const dynamic = 'force-dynamic'

const CACHE_PATH = path.join(os.tmpdir(), 'cc-lens-sessions-cache.json')

export async function POST() {
  // Clear disk cache
  try { await fs.unlink(CACHE_PATH) } catch { /* */ }
  // Clear in-memory cache
  clearSessionCache()
  return NextResponse.json({ cleared: true })
}
