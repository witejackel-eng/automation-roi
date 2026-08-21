'use client'

/**
 * Viableo app shell — Orbit 3-panel layout.
 *
 * Structure (desktop):
 *   CommandDock (60px) | CaseList (280px, collapsible) | CommandStage (flex-1)
 *
 * Structure (mobile):
 *   TopBar (fixed) + CommandStage (flex-1) + TabBar (fixed)
 */
import * as React from 'react'
import {
  Calculator,
  FileText,
  Settings2,
  LayoutDashboard,
  Zap,
} from 'lucide-react'
import { useApp, type View, useTier } from '@/lib/store'
import { cn } from '@/lib/utils'
import { LogoCompact } from '@/components/viableo'
import { StatusPill } from '@/components/status-pill'
import { COMPANY_NAME } from '@/lib/brand'
import { TIER_LABEL, type Tier } from '@/lib/entitlement'
import { CommandDock, type OrbitViewType } from '@/components/orbit/command-dock'
import { CommandStage } from '@/components/orbit/command-stage'
import { CaseList } from '@/components/orbit/case-list'

// Map Viableo views to Orbit nav types
function viewToOrbit(v: View): OrbitViewType {
  switch (v) {
    case 'dashboard': return 'dashboard'
    case 'calculator': return 'calculator'
    case 'projects': return 'projects'
    case 'settings': return 'settings'
    default: return 'dashboard'
  }
}

function orbitToView(o: OrbitViewType): View {
  return o as View
}

function tierLabel(tier: Tier): string {
  return TIER_LABEL[tier]
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const view = useApp((s) => s.view)
  const go = useApp((s) => s.go)
  const projects = useApp((s) => s.projects)
  const sidebarCollapsed = useApp((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useApp((s) => s.setSidebarCollapsed)
  const startCalculator = useApp((s) => s.startCalculator)
  const tier = useTier()

  const handleOrbitViewChange = (ov: OrbitViewType) => {
    go(orbitToView(ov))
  }

  const handleSelectCase = async (id: string) => {
    const ok = await useApp.getState().reopenProject(id)
    if (!ok) go('projects')
  }

  const handleNewCase = () => {
    startCalculator()
  }

  // Determine the stage key for animation
  const stageKey = view

  // Top bar title
  const getTitle = (): string => {
    switch (view) {
      case 'dashboard': return 'Dashboard'
      case 'calculator': return 'New Case'
      case 'results': return 'Results'
      case 'projects': return 'Reports'
      case 'settings': return 'Settings'
      case 'pricing': return 'Pricing'
      case 'landing': return 'Welcome'
      default: return 'Dashboard'
    }
  }

  // Hide sidebar on certain views (calculator, results, pricing)
  const showSidebar = ['dashboard', 'projects', 'settings', 'landing'].includes(view)

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-canvas">
      {/* ── Command Dock (Left Rail — Desktop) ── */}
      <div className="hidden md:block">
        <CommandDock activeView={viewToOrbit(view)} onViewChange={handleOrbitViewChange} />
      </div>

      {/* ── Case List Sidebar (Desktop) ── */}
      {showSidebar && (
        <div className="hidden md:block">
          <CaseList
            cases={projects}
            selectedCaseId={null}
            onSelectCase={handleSelectCase}
            onNewCase={handleNewCase}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-canvas">
        {/* Top bar — desktop */}
        <div className="hidden md:flex h-12 items-center justify-between px-6 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-medium text-ink tracking-tight">{getTitle()}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill variant={tier === 'free' ? 'draft' : 'paid'}>
              {tierLabel(tier)}
            </StatusPill>
          </div>
        </div>

        {/* Stage Content — no extra padding, mobile has pt-14 for top bar */}
        <div className="flex-1 overflow-hidden pt-14 md:pt-0">
          <CommandStage viewKey={stageKey}>{children}</CommandStage>
        </div>
      </div>

      {/* ── Mobile Top Bar ── */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-sm md:hidden">
        <button type="button" onClick={() => go('dashboard')} aria-label={`${COMPANY_NAME} home`}>
          <LogoCompact />
        </button>
        <div className="flex items-center gap-2">
          <StatusPill variant={tier === 'free' ? 'draft' : 'paid'}>
            {tierLabel(tier)}
          </StatusPill>
        </div>
      </header>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-surface/80 backdrop-blur-sm md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Primary mobile"
      >
        {([
          { view: 'dashboard' as View, icon: LayoutDashboard, label: 'Home' },
          { view: 'calculator' as View, icon: Calculator, label: 'New Case' },
          { view: 'projects' as View, icon: FileText, label: 'Reports' },
          { view: 'settings' as View, icon: Settings2, label: 'Settings' },
        ] as const).map((item) => {
          const active = view === item.view
          const Icon = item.icon
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => go(item.view)}
              className={cn(
                'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-brand' : 'text-ink-muted',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              {active && <span className="block h-1 w-1 rounded-full bg-brand" aria-hidden="true" />}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
