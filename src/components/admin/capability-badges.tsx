'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { Capability } from '@/lib/brand'
import {
  Calculator, Zap, GitBranch, Target, Save, FileText, FileSignature,
  Share2, CheckSquare, Palette, History, Users, Code,
  type LucideIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Capability → icon mapping
// ---------------------------------------------------------------------------

const CAPABILITY_ICON: Record<Capability, LucideIcon> = {
  calculate: Calculator,
  stress_test: Zap,
  scenario_analysis: GitBranch,
  confidence_scoring: Target,
  save_project: Save,
  client_report: FileText,
  proposal: FileSignature,
  share_links: Share2,
  share_approval: CheckSquare,
  agency_branding: Palette,
  client_history: History,
  multi_seat: Users,
  api_access: Code,
}

const CAPABILITY_LABEL: Record<Capability, string> = {
  calculate: 'Calculate ROI',
  stress_test: 'Stress test',
  scenario_analysis: 'Scenario analysis',
  confidence_scoring: 'Confidence scoring',
  save_project: 'Save projects',
  client_report: 'Client report',
  proposal: 'Proposal PDF',
  share_links: 'Share links',
  share_approval: 'Share approval',
  agency_branding: 'Agency branding',
  client_history: 'Client history',
  multi_seat: 'Multi-seat',
  api_access: 'API access',
}

/**
 * Capability badges — feature pills with icons for the customer/organization detail pages.
 * Renders the enabled capabilities as a wrap of icon pills.
 */
export function CapabilityBadges({ capabilities, size = 'md' }: { capabilities: Capability[]; size?: 'sm' | 'md' }) {
  if (capabilities.length === 0) {
    return <p className="text-[13px] text-[var(--vcp-ink-muted)]">No capabilities granted.</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {capabilities.map((cap) => {
        const Icon = CAPABILITY_ICON[cap] ?? Target
        const label = CAPABILITY_LABEL[cap] ?? cap
        return (
          <span
            key={cap}
            className={cn(
              'vcp-cap-badge',
              size === 'sm' && 'vcp-cap-badge-sm',
            )}
          >
            <Icon size={size === 'sm' ? 10 : 12} strokeWidth={2} />
            {label}
          </span>
        )
      })}
    </div>
  )
}
