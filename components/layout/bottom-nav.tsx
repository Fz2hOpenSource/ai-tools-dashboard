'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, DollarSign,
  FolderOpen, Activity, Moon, Sun,
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',         label: 'Overview',  icon: LayoutDashboard },
  { href: '/sessions', label: 'Sessions',  icon: MessageSquare   },
  { href: '/costs',    label: 'Costs',     icon: DollarSign      },
  { href: '/projects', label: 'Projects',  icon: FolderOpen      },
  { href: '/activity', label: 'Activity',  icon: Activity        },
]

export function BottomNav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/90 backdrop-blur-lg border-t border-sidebar-border flex">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-200 relative',
              active
                ? 'text-sidebar-primary'
                : 'text-sidebar-foreground/35 hover:text-sidebar-foreground/60',
            )}
          >
            {/* active indicator dot */}
            {active && (
              <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sidebar-primary shadow-[0_0_6px_var(--sidebar-primary)]" />
            )}
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors text-sidebar-foreground/35 hover:text-sidebar-foreground/60 cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span className="text-[10px] font-medium leading-none">Theme</span>
      </button>
    </nav>
  )
}
