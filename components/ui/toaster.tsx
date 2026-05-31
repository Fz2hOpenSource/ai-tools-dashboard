'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToast, useToastContext } from '@/lib/toast'
import type { Toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ElementType> = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
}

const STYLES: Record<string, string> = {
  default: 'border-amber-500/30',
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
}

const ICON_COLORS: Record<string, string> = {
  default: 'text-amber-400',
  success: 'text-emerald-400',
  error: 'text-red-400',
}

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast()
  const Icon = ICONS[toast.variant ?? 'default'] ?? Info

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'flex items-start gap-3 w-80 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-xl',
        'bg-card/95 dark:bg-card/90',
        STYLES[toast.variant ?? 'default'] ?? STYLES.default,
      )}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', ICON_COLORS[toast.variant ?? 'default'])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function Toaster() {
  const { toasts } = useToastContext()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
