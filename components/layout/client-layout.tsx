'use client'

import { useSidebar } from '@/components/layout/sidebar-context'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <main
      className={[
        'flex-1 min-h-screen overflow-x-hidden bg-background pb-16 md:pb-0',
        'transition-[margin] duration-300',
        collapsed ? 'md:ml-14' : 'md:ml-56',
      ].join(' ')}
    >
      {children}

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-3 px-6 flex items-center justify-center gap-2 mb-16 md:mb-0">
        <p className="text-[11px] text-muted-foreground/50">
          Made by{' '}
          <a
            href="https://github.com/Arindam200"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors duration-200"
          >
            Arindam
          </a>
        </p>
        <span className="text-muted-foreground/20 text-[10px]">·</span>
        <a
          href="https://deerflow.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground/35 hover:text-muted-foreground/70 transition-all duration-300"
        >
          ✦ Deerflow
        </a>
      </footer>
    </main>
  )
}
