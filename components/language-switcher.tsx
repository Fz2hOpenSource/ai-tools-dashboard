'use client'

import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')}
      aria-label={t('lang.label')}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium',
        'bg-muted/40 border border-border/50 text-muted-foreground',
        'hover:bg-muted hover:text-foreground hover:border-border',
        'transition-all duration-200 cursor-pointer font-mono',
      )}
    >
      <Globe className="w-3 h-3" />
      <span className="hidden sm:inline">{t('lang.switch')}</span>
    </button>
  )
}
