'use client'

import useSWR from 'swr'
import { TopBar } from '@/components/layout/top-bar'
import { SessionTable } from '@/components/sessions/session-table'
import type { SessionWithFacet } from '@/types/claude'

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error(`API error ${r.status}`); return r.json() })

export default function SessionsPage() {
  const { data, error, isLoading } = useSWR<{ sessions: SessionWithFacet[]; total: number }>(
    '/api/sessions',
    fetcher,
    { refreshInterval: 30_000 }
  )

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Sessions"
        subtitle={data ? `${data.total} total sessions` : 'loading...'}
      />
      <div className="p-4 sm:p-6">
        {error && (
          <div className="border border-destructive/30 rounded-xl p-6 bg-destructive/5 mb-4">
            <p className="text-sm text-destructive font-mono">✗ {String(error)}</p>
          </div>
        )}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted/40 rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        )}
        {data && <SessionTable sessions={data.sessions} />}
      </div>
    </div>
  )
}
