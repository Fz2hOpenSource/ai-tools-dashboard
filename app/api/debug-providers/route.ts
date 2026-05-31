import { NextResponse } from 'next/server'
import { openclawReader } from '@/lib/readers/openclaw'
import { codexReader } from '@/lib/readers/codex'
import { getSessions } from '@/lib/claude-reader'

export const dynamic = 'force-dynamic'

export async function GET() {
  const openclawOk = openclawReader.info.available
  const codexOk = codexReader.info.available

  let openclawSessions: unknown[] = []
  let openclawError = ''
  let claudeCount = 0

  if (openclawOk) {
    try { openclawSessions = await openclawReader.getSessions() }
    catch (e) { openclawError = (e as Error).message }
  }

  try {
    const sessions = await getSessions()
    claudeCount = sessions.filter((s) => ((s as unknown as Record<string, unknown>)._provider ?? 'claude') === 'claude').length
  } catch { /* */ }

  return NextResponse.json({
    claude: { available: true, sessionCount: claudeCount },
    openclaw: { available: openclawOk, sessionCount: openclawSessions.length, error: openclawError },
    codex: { available: codexOk, sessionCount: 0 },
  })
}
