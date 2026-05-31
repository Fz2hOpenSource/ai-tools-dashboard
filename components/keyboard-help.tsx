'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard, Navigation, Search, List, Command } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/* ── Shortcut data (actions are i18n keys) ── */
interface ShortcutGroup {
  id: string
  titleKey: string
  icon: React.ElementType
  shortcuts: { keys: string[]; actionKey: string }[]
}

function useShortcutGroups() {
  const { t } = useI18n()
  return [
    {
      id: 'navigation',
      titleKey: 'kbd.navigation',
      icon: Navigation,
      shortcuts: [
        { keys: ['g', 's'], actionKey: 'nav.sessions' },
        { keys: ['g', 'p'], actionKey: 'nav.projects' },
        { keys: ['g', 'c'], actionKey: 'nav.costs' },
        { keys: ['g', 't'], actionKey: 'nav.tools' },
        { keys: ['g', 'a'], actionKey: 'nav.activity' },
        { keys: ['g', 'm'], actionKey: 'nav.memory' },
        { keys: ['g', 'e'], actionKey: 'nav.export' },
        { keys: ['g', 'l'], actionKey: 'nav.plans' },
        { keys: ['g', 'y'], actionKey: 'nav.history' },
        { keys: ['g', 'o'], actionKey: 'nav.todos' },
        { keys: ['g', 'h'], actionKey: 'nav.overview' },
      ],
    },
    {
      id: 'search',
      titleKey: 'kbd.search_commands',
      icon: Search,
      shortcuts: [
        { keys: ['/'], actionKey: 'kbd.quick_search' },
        { keys: ['⌘', 'K'], actionKey: 'kbd.command_palette' },
        { keys: ['?'], actionKey: 'kbd.keyboard_help' },
        { keys: ['Esc'], actionKey: 'kbd.close_cancel' },
      ],
    },
    {
      id: 'sessions',
      titleKey: 'kbd.session_list',
      icon: List,
      shortcuts: [
        { keys: ['j'], actionKey: 'kbd.move_down' },
        { keys: ['k'], actionKey: 'kbd.move_up' },
        { keys: ['↵'], actionKey: 'kbd.open_selected' },
        { keys: ['Esc'], actionKey: 'kbd.clear_selection' },
      ],
    },
  ]
}

/* ── Key pill sub-component ── */
function KeyPill({ label, amber }: { label: string; amber?: boolean }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-md',
        'text-[11px] font-mono font-medium tracking-wide',
        'border shadow-inner transition-colors duration-200',
        'select-none',
        amber
          ? 'text-amber-300 border-amber-500/40 bg-amber-500/10 shadow-[inset_0_1px_0_rgba(245,158,11,0.15),0_0_6px_rgba(245,158,11,0.12)]'
          : 'text-muted-foreground border-muted-foreground/20 bg-muted/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
      )}
    >
      {label}
    </kbd>
  )
}

function KeyPillSpacer() {
  return <span className="text-muted-foreground/25 text-[10px] mx-0.5 select-none">+</span>
}

/* ── Shortcut row ── */
function ShortcutRow({ keys, actionLabel }: { keys: string[]; actionLabel: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -6 },
        visible: { opacity: 1, x: 0 },
      }}
      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors duration-150 group"
    >
      <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
        {actionLabel}
      </span>
      <span className="inline-flex items-center gap-0.5">
        {keys.map((key, i) => (
          <span key={i} className="inline-flex items-center gap-0.5">
            {i > 0 && <KeyPillSpacer />}
            <KeyPill label={key} amber={key === 'g' || key === '?' || key === '/'} />
          </span>
        ))}
      </span>
    </motion.div>
  )
}

/* ── Group section ── */
function ShortcutGroupCard({
  group,
  index,
  t,
}: {
  group: ReturnType<typeof useShortcutGroups>[number]
  index: number
  t: (k: string) => string
}) {
  const Icon = group.icon
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'rounded-xl border border-border/60 overflow-hidden',
        'bg-card/70 backdrop-blur-sm',
        'dark:shadow-[0_0_20px_rgba(0,0,0,0.2)]',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Icon className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{t(group.titleKey)}</h3>
      </div>

      {/* Shortcuts */}
      <div className="px-2 py-2 divide-y divide-border/10">
        {group.shortcuts.map((s, i) => (
          <ShortcutRow key={i} keys={s.keys} actionLabel={t(s.actionKey)} />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Main component ── */
export default function KeyboardHelp() {
  const { t } = useI18n()
  const GROUPS = useShortcutGroups()
  const [open, setOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    // Toggle with ?
    if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault()
      setOpen(prev => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          'max-w-2xl w-[calc(100%-2rem)] p-0 gap-0',
          'bg-background/98 backdrop-blur-2xl border-border/50',
          'shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(224,120,10,0.08)]',
          'dark:shadow-[0_0_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(224,120,10,0.12)]',
          'overflow-hidden',
        )}
      >
        {/* CRT noise texture */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '256px 256px',
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border/30 bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Keyboard className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                {t('kbd.title')}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
                {t('kbd.toggle_hint')} <KeyPill label="?" amber />
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={open ? 'visible' : 'hidden'}
          className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 max-h-[60vh] overflow-y-auto"
        >
          {GROUPS.map((group, i) => (
            <div key={group.id} className={group.id === 'navigation' ? 'md:col-span-2' : ''}>
              <ShortcutGroupCard group={group} index={i} t={t} />
            </div>
          ))}
        </motion.div>

        {/* Deerflow branding */}
        <div className="relative z-10 border-t border-border/20 px-5 py-2.5 flex items-center justify-center">
          <a
            href="https://deerflow.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors duration-300 tracking-wide"
          >
            ✦ Created by Deerflow
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
