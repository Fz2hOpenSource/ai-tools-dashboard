'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderOpen, MessageSquare, DollarSign,
  Wrench, Activity, History, CheckSquare, FileText,
  Brain, Settings, Download, Moon, Sun, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useSidebar } from '@/components/layout/sidebar-context'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',         label: 'Overview',  icon: LayoutDashboard },
  { href: '/projects', label: 'Projects',  icon: FolderOpen      },
  { href: '/sessions', label: 'Sessions',  icon: MessageSquare   },
  { href: '/costs',    label: 'Costs',     icon: DollarSign      },
  { href: '/tools',    label: 'Tools',     icon: Wrench          },
  { href: '/activity', label: 'Activity',  icon: Activity        },
  { href: '/history',  label: 'History',   icon: History         },
  { href: '/todos',    label: 'Todos',     icon: CheckSquare     },
  { href: '/plans',    label: 'Plans',     icon: FileText        },
  { href: '/memory',   label: 'Memory',    icon: Brain           },
  { href: '/settings', label: 'Settings',  icon: Settings        },
  { href: '/export',   label: 'Export',    icon: Download        },
]

function NavItem({
  href, label, icon: Icon, active, collapsed,
}: {
  href: string; label: string; icon: React.ElementType; active: boolean; collapsed: boolean
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative',
        collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
        active
          ? 'text-sidebar-primary bg-sidebar-accent'
          : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/60',
      )}
    >
      {/* active indicator — subtle amber dot */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary shadow-[0_0_8px_var(--sidebar-primary)]" />
      )}
      <Icon className={cn(
        'w-4 h-4 shrink-0 transition-all duration-200',
        active
          ? 'text-sidebar-primary drop-shadow-[0_0_6px_var(--sidebar-primary)]'
          : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70',
      )} />
      {!collapsed && (
        <span className={cn('transition-all duration-200', active ? 'translate-x-0.5' : '')}>{label}</span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">{label}</TooltipContent>
      </Tooltip>
    )
  }
  return link
}

function SidebarContents({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { theme, toggle: toggleTheme } = useTheme()
  const { toggle: toggleCollapsed } = useSidebar()

  return (
    <div className="flex flex-col h-full">
      {/* ── Header / Logo ── */}
      <div className={cn(
        'border-b border-sidebar-border flex items-center relative',
        collapsed ? 'justify-center px-2 py-4' : 'justify-between px-4 pt-5 pb-4',
      )}>
        {!collapsed && (
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] leading-none tracking-[0.08em]',
              'select-none font-bold',
              'text-[#9a3412] bg-linear-to-b from-[#f97316]/12 to-[#f97316]/5',
              'ring-1 ring-inset ring-[#f97316]/25',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_3px_rgba(24,24,27,0.06)]',
              'dark:text-[#e0780a] dark:from-[#e0780a]/15 dark:to-[#e0780a]/6 dark:ring-[#e0780a]/30',
              'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_-6px_rgba(224,120,10,0.35)]',
            )}
            style={{ fontFamily: 'var(--font-press-start)' }}
          >
            <span className="dark:[text-shadow:0_0_12px_rgba(224,120,10,0.5)] [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
              CC Lens
            </span>
            {/* tiny indicator dot */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] dark:bg-[#e0780a] shadow-[0_0_6px_rgba(224,120,10,0.6)]" />
          </span>
        )}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex p-1.5 rounded-md text-sidebar-foreground/30 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent transition-all duration-200 cursor-pointer"
        >
          {collapsed
            ? <PanelLeft className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className={cn('flex-1 py-4 space-y-0.5 overflow-y-auto', collapsed ? 'px-1' : 'px-3')}>
        <TooltipProvider delayDuration={150}>
          {NAV.map(({ href, label, icon }) => (
            <div key={href} onClick={onNavigate}>
              <NavItem
                href={href}
                label={label}
                icon={icon}
                active={pathname === href}
                collapsed={collapsed}
              />
            </div>
          ))}
        </TooltipProvider>
      </nav>

      {/* ── Footer ── */}
      <div className={cn(
        'border-t border-sidebar-border flex items-center',
        collapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3',
      )}>
        {!collapsed && (
          <a
            href="https://github.com/Arindam200/cc-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-sidebar-foreground/35 hover:text-sidebar-foreground/70 transition-colors duration-200"
          >
            Made by Arindam
          </a>
        )}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-md text-sidebar-foreground/30 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent transition-all duration-200 cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      {/* Desktop sidebar — with subtle edge glow */}
      <aside
        className={cn(
          'hidden md:flex fixed left-0 top-0 h-screen flex-col border-r border-sidebar-border bg-sidebar z-40',
          'transition-[width] duration-300 overflow-hidden',
          collapsed ? 'w-14' : 'w-56',
          'after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gradient-to-b after:from-sidebar-primary/30 after:via-transparent after:to-sidebar-primary/10',
        )}
      >
        <SidebarContents collapsed={collapsed} />
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-56 p-0 bg-sidebar border-sidebar-border">
          <SidebarContents onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
