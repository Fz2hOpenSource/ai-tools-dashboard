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

    // ── Dashboard Overview ──
    'overview.projects': 'projects',
    'overview.stored': 'stored',
    'overview.sessions': 'Sessions',
    'overview.messages': 'Messages',
    'overview.tokens': 'Tokens',
    'overview.cost': 'Est. Cost',
    'overview.storage': 'Storage',
    'overview.usage_over_time': 'Usage Over Time',
    'overview.model_breakdown': 'Model Breakdown',
    'overview.peak_hours': 'Peak Hours',
    'overview.project_activity': 'Project Activity',
    'overview.token_breakdown': 'Token Breakdown',
    'overview.recent_sessions': 'Recent Sessions',
    'overview.active_24h': 'Active 24h',
    'overview.recent_7d': 'Recent 7d',
    'overview.all_time': 'All Time',
    'overview.date_presets': '7d / 30d / 90d',

    // ── Session Table ──
    'sessions.search': 'Search sessions…',
    'sessions.no_results': 'No sessions match filters',
    'sessions.page': 'Page',
    'sessions.of': '/',
    'sessions.sessions': 'sessions',
    'sessions.total': 'total sessions',
    'sessions.flags': 'Flags',

    // ── Session Detail ──
    'session.assistant_messages': 'Assistant messages',
    'session.input_output_cache': 'Input + output + cache',
    'session.estimated': 'Estimated',
    'session.minutes': 'min',
    'session.show_full': 'Show full response',
    'session.show_less': 'Show less',
    'session.thinking': 'Thinking',
    'session.token_accumulation': 'Token Accumulation',
    'session.context_tokens': 'Context Tokens',
    'session.compaction_ref': 'Compaction',
    'session.conversation': 'Conversation',

    // ── Costs ──
    'costs.total': 'Total Est. Cost',
    'costs.cache_savings': 'Cache Savings',
    'costs.without_cache': 'Without Cache',
    'costs.cost_over_time': 'Cost Over Time',
    'costs.cost_by_project': 'Cost by Project',
    'costs.model_breakdown': 'Model Breakdown',
    'costs.cache_efficiency': 'Cache Efficiency',
    'costs.pricing_reference': 'Pricing Reference (per M tokens)',
    'costs.model': 'Model',
    'costs.input': 'Input',
    'costs.output': 'Output',
    'costs.estimated_cost': 'Est. Cost',
    'costs.cache_hit_rate': 'Cache Hit Rate',

    // ── Tools ──
    'tools.total_calls': 'Total Tool Calls',
    'tools.unique_tools': 'Unique Tools',
    'tools.mcp_servers': 'MCP Servers',
    'tools.errors': 'Errors',
    'tools.tool_ranking': 'Tool Ranking',
    'tools.mcp_details': 'MCP Server Details',
    'tools.feature_adoption': 'Feature Adoption',
    'tools.error_analysis': 'Error Analysis',
    'tools.version_history': 'Claude Code Version History',
    'tools.git_branches': 'Git Branch Analytics',
    'tools.category_legend': 'Categories',

    // ── Activity ──
    'activity.current_streak': 'Current Streak',
    'activity.longest_streak': 'Longest Streak',
    'activity.active_days': 'Active Days',
    'activity.most_active_day': 'Most Active Day',
    'activity.days': 'days',
    'activity.peak_hours': 'Peak Hours',
    'activity.usage_over_time_90d': 'Usage Over Time (90 days)',
    'activity.day_of_week': 'Day of Week',

    // ── Projects ──
    'projects.search': 'Search projects…',
    'projects.no_results': 'No projects match your search.',
    'projects.no_found': 'No projects found in ~/.claude/',
    'projects.loading': 'Loading…',

    // ── History ──
    'history.search': 'Search commands…',

    // ── Todos ──
    'todos.all': 'All',
    'todos.pending': 'Pending',
    'todos.in_progress': 'In Progress',
    'todos.done': 'Done',
    'todos.search': 'Search todos…',

    // ── Plans ──
    'plans.search': 'Search plans…',

    // ── Memory ──
    'memory.total': 'Total Files',
    'memory.projects': 'Projects',
    'memory.feedback': 'Feedback',
    'memory.stale': 'Stale',
    'memory.type_all': 'All',
    'memory.type_user': 'User',
    'memory.type_feedback': 'Feedback',
    'memory.type_project': 'Project',
    'memory.type_reference': 'Reference',
    'memory.type_index': 'Index',
    'memory.search': 'Search memories…',

    // ── Settings ──
    'settings.storage_used': 'Storage Used',
    'settings.skills': 'Skills',
    'settings.plugins': 'Plugins',
    'settings.mcp_servers': 'MCP Servers',
    'settings.raw_settings': 'Raw Settings',

    // ── Export ──
    'export.title': 'Export & Import',
    'export.export_data': 'Export Data',
    'export.import_data': 'Import Data',
    'export.download': 'Download',
    'export.drop_here': 'Drop .cclens.json here to preview',

    // ── Keyboard Help ──
    'kbd.title': 'Keyboard Shortcuts',
    'kbd.toggle_hint': 'Press ? to toggle',
    'kbd.navigation': 'Navigation',
    'kbd.search_commands': 'Search & Commands',
    'kbd.session_list': 'Session List',
    'kbd.quick_search': 'Quick search',
    'kbd.command_palette': 'Command palette',
    'kbd.keyboard_help': 'Keyboard help',
    'kbd.close_cancel': 'Close / cancel',
    'kbd.move_down': 'Move down',
    'kbd.move_up': 'Move up',
    'kbd.open_selected': 'Open selected',
    'kbd.clear_selection': 'Clear selection',

    // ── Theme ──
    'theme.toggle': 'Toggle theme',
    'theme.dark': 'Dark',
    'theme.light': 'Light',

    // ── Misc ──
    'made_by': 'Made by',
    'error_loading': 'Error loading data',
    'prev': 'Prev',
    'next': 'Next',
    'save': 'Save',
    'cancel': 'Cancel',
    'close': 'Close',
    'confirm': 'Confirm',
    'no_results': 'No results',
    'error_api': 'Error loading data: ',
    'activity_calendar': 'Activity Calendar',
    'env_vars': 'Environment Variables',
    'what_exported': 'What will be exported',
    'date_range_optional': 'Date range (optional)',
    'merge_preview': 'Merge preview',
    'scope_label': 'scope: ',
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

    // ── Dashboard Overview ──
    'overview.projects': '个项目',
    'overview.stored': '已用存储',
    'overview.sessions': '会话数',
    'overview.messages': '消息数',
    'overview.tokens': 'Token 用量',
    'overview.cost': '预估费用',
    'overview.storage': '存储用量',
    'overview.usage_over_time': '用量趋势',
    'overview.model_breakdown': '模型分布',
    'overview.peak_hours': '高峰时段',
    'overview.project_activity': '项目活跃度',
    'overview.token_breakdown': 'Token 分类',
    'overview.recent_sessions': '最近会话',
    'overview.active_24h': '活跃 24h',
    'overview.recent_7d': '最近 7 天',
    'overview.all_time': '全部',
    'overview.date_presets': '7天 / 30天 / 90天',

    // ── Session Table ──
    'sessions.search': '搜索会话…',
    'sessions.no_results': '没有匹配的会话',
    'sessions.page': '第',
    'sessions.of': '/',
    'sessions.sessions': '个会话',
    'sessions.total': '个会话',
    'sessions.flags': '标记',

    // ── Session Detail ──
    'session.assistant_messages': '条助手消息',
    'session.input_output_cache': '输入 + 输出 + 缓存',
    'session.estimated': '预估',
    'session.minutes': '分钟',
    'session.show_full': '展开完整回复',
    'session.show_less': '收起',
    'session.thinking': '思考过程',
    'session.token_accumulation': 'Token 累积',
    'session.context_tokens': '上下文 Token',
    'session.compaction_ref': '上下文压缩',
    'session.conversation': '对话',

    // ── Costs ──
    'costs.total': '预估总费用',
    'costs.cache_savings': '缓存节省',
    'costs.without_cache': '无缓存对比',
    'costs.cost_over_time': '费用趋势',
    'costs.cost_by_project': '按项目费用',
    'costs.model_breakdown': '按模型明细',
    'costs.cache_efficiency': '缓存效率',
    'costs.pricing_reference': '定价参考（每百万 Token）',
    'costs.model': '模型',
    'costs.input': '输入',
    'costs.output': '输出',
    'costs.estimated_cost': '预估费用',
    'costs.cache_hit_rate': '缓存命中率',

    // ── Tools ──
    'tools.total_calls': '工具调用总数',
    'tools.unique_tools': '不同工具数',
    'tools.mcp_servers': 'MCP 服务器',
    'tools.errors': '错误数',
    'tools.tool_ranking': '工具排行榜',
    'tools.mcp_details': 'MCP 服务器详情',
    'tools.feature_adoption': '功能采纳率',
    'tools.error_analysis': '错误分析',
    'tools.version_history': 'Claude Code 版本历史',
    'tools.git_branches': 'Git 分支分析',
    'tools.category_legend': '分类图例',

    // ── Activity ──
    'activity.current_streak': '当前连续',
    'activity.longest_streak': '最长连续',
    'activity.active_days': '活跃天数',
    'activity.most_active_day': '最活跃日',
    'activity.days': '天',
    'activity.peak_hours': '高峰时段',
    'activity.usage_over_time_90d': '90 天用量趋势',
    'activity.day_of_week': '星期分布',

    // ── Projects ──
    'projects.search': '搜索项目…',
    'projects.no_results': '没有匹配的项目',
    'projects.no_found': '~/.claude/ 中未找到项目',
    'projects.loading': '加载中…',

    // ── History ──
    'history.search': '搜索命令…',

    // ── Todos ──
    'todos.all': '全部',
    'todos.pending': '待处理',
    'todos.in_progress': '进行中',
    'todos.done': '已完成',
    'todos.search': '搜索待办…',

    // ── Plans ──
    'plans.search': '搜索计划…',

    // ── Memory ──
    'memory.total': '总文件数',
    'memory.projects': '项目数',
    'memory.feedback': '反馈',
    'memory.stale': '过期',
    'memory.type_all': '全部',
    'memory.type_user': '用户',
    'memory.type_feedback': '反馈',
    'memory.type_project': '项目',
    'memory.type_reference': '参考',
    'memory.type_index': '索引',
    'memory.search': '搜索记忆…',

    // ── Settings ──
    'settings.storage_used': '已用存储',
    'settings.skills': '技能',
    'settings.plugins': '插件',
    'settings.mcp_servers': 'MCP 服务器',
    'settings.raw_settings': '原始配置',

    // ── Export ──
    'export.title': '导出与导入',
    'export.export_data': '导出数据',
    'export.import_data': '导入数据',
    'export.download': '下载',
    'export.drop_here': '拖入 .cclens.json 文件预览',

    // ── Keyboard Help ──
    'kbd.title': '键盘快捷键',
    'kbd.toggle_hint': '按 ? 开关',
    'kbd.navigation': '导航',
    'kbd.search_commands': '搜索与命令',
    'kbd.session_list': '会话列表',
    'kbd.quick_search': '快速搜索',
    'kbd.command_palette': '命令面板',
    'kbd.keyboard_help': '键盘帮助',
    'kbd.close_cancel': '关闭 / 取消',
    'kbd.move_down': '下移',
    'kbd.move_up': '上移',
    'kbd.open_selected': '打开选中',
    'kbd.clear_selection': '清除选择',

    // ── Theme ──
    'theme.toggle': '切换主题',
    'theme.dark': '深色',
    'theme.light': '浅色',

    // ── Misc ──
    'made_by': '由',
    'error_loading': '加载数据出错',
    'prev': '上一页',
    'next': '下一页',
    'save': '保存',
    'cancel': '取消',
    'close': '关闭',
    'confirm': '确认',
    'no_results': '无结果',
    'error_api': '加载数据出错: ',
    'activity_calendar': '活跃日历',
    'env_vars': '环境变量',
    'what_exported': '导出内容',
    'date_range_optional': '日期范围（可选）',
    'merge_preview': '合并预览',
    'scope_label': '范围: ',
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
