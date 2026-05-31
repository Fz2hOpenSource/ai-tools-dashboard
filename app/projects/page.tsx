'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { TopBar } from '@/components/layout/top-bar'
import { ProjectCard } from '@/components/projects/project-card'
import type { ProjectSummary } from '@/types/claude'
import { Input } from '@/components/ui/input'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error(`API error ${r.status}`); return r.json() })

type SortKey = 'last_active' | 'estimated_cost' | 'session_count' | 'total_duration_minutes'

const SORT_KEYS: SortKey[] = ['last_active', 'estimated_cost', 'session_count', 'total_duration_minutes']
const SORT_I18N: Record<SortKey, string> = {
  last_active: 'sort.recent',
  estimated_cost: 'sort.cost',
  session_count: 'sort.sessions',
  total_duration_minutes: 'sort.time',
}

export default function ProjectsPage() {
  const { data, error, isLoading } = useSWR<{ projects: ProjectSummary[] }>(
    '/api/projects', fetcher, { refreshInterval: 5_000 }
  )
  const { t } = useI18n()
  const [sort, setSort] = useState<SortKey>('last_active')
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    if (!data) return []
    let projects = [...data.projects]
    if (search) {
      const q = search.toLowerCase()
      projects = projects.filter(p =>
        p.display_name.toLowerCase().includes(q) ||
        p.project_path.toLowerCase().includes(q)
      )
    }
    return projects.sort((a, b) => {
      if (sort === 'last_active') return b.last_active.localeCompare(a.last_active)
      return (b[sort] as number) - (a[sort] as number)
    })
  }, [data, sort, search])

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        titleKey="title.projects"
        subtitle={data ? `${data.projects.length} projects` : 'Loading…'}
      />
      <div className="p-6 space-y-4">

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error loading data: {String(error)}</AlertDescription>
          </Alert>
        )}

        {/* Search + sort toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('projects.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>{t(SORT_I18N[k])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} variant="stat" className="h-48" />)}
          </div>
        )}

        {sorted.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map(p => <ProjectCard key={p.slug} project={p} />)}
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {search ? t('projects.no_results') : t('projects.no_found')}
          </div>
        )}
      </div>
    </div>
  )
}
