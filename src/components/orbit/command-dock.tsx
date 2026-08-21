'use client'

import { LayoutDashboard, Calculator, FileText, Settings2, Orbit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShellAuthIndicator } from '@/components/app-shell-auth-indicator'

export type OrbitViewType = 'dashboard' | 'calculator' | 'projects' | 'settings'

interface CommandDockProps {
  activeView: OrbitViewType
  onViewChange: (view: OrbitViewType) => void
}

const navItems: { id: OrbitViewType; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'calculator', icon: Calculator, label: 'Calculator' },
  { id: 'projects', icon: FileText, label: 'Reports' },
  { id: 'settings', icon: Settings2, label: 'Settings' },
]

export function CommandDock({ activeView, onViewChange }: CommandDockProps) {
  return (
    <div className="w-[60px] h-full flex flex-col items-center py-5 bg-surface/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="mb-10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ink/5 to-ink/3 flex items-center justify-center">
          <Orbit className="w-[18px] h-[18px] text-brand" strokeWidth={1.5} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'relative w-10 h-10 flex items-center justify-center rounded-md transition-all duration-150 group',
                isActive
                  ? 'text-brand'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator - minimal line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-brand rounded-r-full" />
              )}
              
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />

              {/* Tooltip - clean */}
              <span className="absolute left-14 px-2.5 py-1.5 bg-ink text-surface rounded-md text-[11px] font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* User avatar - auth indicator */}
      <div className="mt-auto pt-6">
        <AppShellAuthIndicator />
      </div>
    </div>
  )
}
