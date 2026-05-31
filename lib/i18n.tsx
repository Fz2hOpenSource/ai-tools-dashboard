'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type Locale = 'zh-CN' | 'en'

// ─── Translation dictionary ──────────────────────────────────────────────────

const DICT: Record<Locale, Record<string, string>> = {
  en: {
    // Sidebar
    'nav.overview': 'Overview',
    'nav.projects': 'Projects',
    'nav.sessions': 'Sessions',
    'nav.costs': 'Costs',
    'nav.tools': 'Tools',
    'nav.activity': 'Activity',
    'nav.history': 'History',
    'nav.todos': 'Todos',
    'nav.plans': 'Plans',
    'nav.memory': 'Memory',
    'nav.settings': 'Settings',
    'nav.export': 'Export',

    // TopBar
    'title.overview': 'Claude Code Analytics',
    'subtitle.overview': 'Real-time monitoring dashboard',
    'title.projects': 'Projects',
    'title.sessions': 'Sessions',
    'title.costs': 'Costs',
    'title.tools': 'Tools & Features',
    'title.activity': 'Activity',
    'title.history': 'Command History',
    'title.todos': 'Todos',
    'title.plans': 'Saved Plans',
    'title.memory': 'Memory',
    'title.settings': 'Settings',
    'title.export': 'Export & Import',

    // Common
    'search': 'Search',
    'refresh': 'Refresh',
    'refreshing': 'Refreshing…',
    'loading': 'Loading…',
    'no_data': 'No data',
    'all': 'All',

    // Filters
    'filter.compact': 'Compact',
    'filter.agent': 'Agent',
    'filter.mcp': 'MCP',
    'filter.starred': 'Starred',

    // Sort
    'sort.date': 'Date',
    'sort.project': 'Project',
    'sort.duration': 'Dur',
    'sort.messages': 'Msgs',
    'sort.tools': 'Tools',
    'sort.cost': 'Cost',
    'sort.recent': 'Recent',
    'sort.sessions': 'Sessions',
    'sort.time': 'Time',

    // Session detail
    'session.turns': 'Turns',
    'session.tokens': 'Tokens',
    'session.cost': 'Cost',
    'session.duration': 'Duration',
    'session.compactions': 'Compactions',
    'session.star': 'Star session',
    'session.starred': 'Starred',

    // Provider
    'provider.all': 'All',
    'provider.claude': 'Claude Code',
    'provider.openclaw': 'OpenClaw',
    'provider.codex': 'Codex',

    // Toast
    'toast.starred': 'Session starred',
    'toast.unstarred': 'Session unstarred',
    'toast.refreshed': 'Data refreshed',

    // Language
    'lang.switch': '中文',
    'lang.label': 'Language',
  },

  'zh-CN': {
    // Sidebar
    'nav.overview': '总览',
    'nav.projects': '项目',
    'nav.sessions': '会话',
    'nav.costs': '费用',
    'nav.tools': '工具',
    'nav.activity': '活跃度',
    'nav.history': '历史',
    'nav.todos': '待办',
    'nav.plans': '计划',
    'nav.memory': '记忆',
    'nav.settings': '设置',
    'nav.export': '导出',

    // TopBar
    'title.overview': 'Claude Code 使用分析',
    'subtitle.overview': '实时数据监控仪表盘',
    'title.projects': '项目',
    'title.sessions': '会话',
    'title.costs': '费用',
    'title.tools': '工具与功能',
    'title.activity': '活跃度',
    'title.history': '命令历史',
    'title.todos': '待办事项',
    'title.plans': '已存计划',
    'title.memory': '记忆',
    'title.settings': '设置',
    'title.export': '导出与导入',

    // Common
    'search': '搜索',
    'refresh': '刷新',
    'refreshing': '刷新中…',
    'loading': '加载中…',
    'no_data': '暂无数据',
    'all': '全部',

    // Filters
    'filter.compact': '压缩',
    'filter.agent': 'Agent',
    'filter.mcp': 'MCP',
    'filter.starred': '已收藏',

    // Sort
    'sort.date': '日期',
    'sort.project': '项目',
    'sort.duration': '时长',
    'sort.messages': '消息',
    'sort.tools': '工具',
    'sort.cost': '费用',
    'sort.recent': '最近',
    'sort.sessions': '会话数',
    'sort.time': '时间',

    // Session detail
    'session.turns': '轮次',
    'session.tokens': 'Token',
    'session.cost': '费用',
    'session.duration': '时长',
    'session.compactions': '压缩',
    'session.star': '收藏会话',
    'session.starred': '已收藏',

    // Provider
    'provider.all': '全部',
    'provider.claude': 'Claude Code',
    'provider.openclaw': 'OpenClaw',
    'provider.codex': 'Codex',

    // Toast
    'toast.starred': '已收藏会话',
    'toast.unstarred': '已取消收藏',
    'toast.refreshed': '数据已刷新',

    // Language
    'lang.switch': 'EN',
    'lang.label': '语言',
  },
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale
  t: (key: string) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: (key) => key,
  setLocale: () => {},
})

export function useI18n() {
  return useContext(I18nContext)
}

const STORAGE_KEY = 'cc-lens-locale'

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language || ''
  return lang.startsWith('zh') ? 'zh-CN' : 'en'
}

function loadLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh-CN' || stored === 'en') return stored
  } catch { /* */ }
  return detectBrowserLocale()
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    setLocaleState(loadLocale())
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* */ }
  }, [])

  const t = useCallback((key: string): string => {
    return DICT[locale]?.[key] ?? DICT.en[key] ?? key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}
