'use client'

import React from "react"
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, ChevronDown, Plus, PanelLeftClose, PanelLeft, Sparkles, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SavedProject } from '@/lib/store'

interface CaseListProps {
  cases: SavedProject[]
  selectedCaseId: string | null
  onSelectCase: (id: string) => void
  onNewCase: () => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

type SortOption = 'name' | 'date' | 'status'
type FilterChip = 'all' | 'build' | 'consider' | 'dont_build'

const filterChips: { id: FilterChip; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'build', label: 'Build', icon: <CheckCircle2 className="w-3 h-3" /> },
  { id: 'consider', label: 'Consider', icon: <AlertTriangle className="w-3 h-3" /> },
  { id: 'dont_build', label: "Don't Build", icon: <XCircle className="w-3 h-3" /> },
]

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

function getRecommendationBadgeClasses(recommendation: SavedProject['recommendation']): string {
  switch (recommendation) {
    case 'build': return 'bg-emerald-500/10 text-emerald-600'
    case 'consider': return 'bg-amber-500/10 text-amber-600'
    case 'dont_build': return 'bg-red-500/10 text-red-600'
  }
}

function getRecommendationDotClasses(recommendation: SavedProject['recommendation']): string {
  switch (recommendation) {
    case 'build': return 'bg-emerald-500'
    case 'consider': return 'bg-amber-500'
    case 'dont_build': return 'bg-red-500'
  }
}

function getRecommendationLabel(recommendation: SavedProject['recommendation']): string {
  switch (recommendation) {
    case 'build': return 'Build'
    case 'consider': return 'Consider'
    case 'dont_build': return "Don't Build"
  }
}

export function CaseList({ cases, selectedCaseId, onSelectCase, onNewCase, sidebarCollapsed, onToggleSidebar }: CaseListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all')

  const filteredAndSortedCases = useMemo(() => {
    let filtered = [...cases]

    // Apply filter chip
    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => c.recommendation === activeFilter)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) => c.clientName.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.clientName.localeCompare(b.clientName)
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'status': {
          const order: Record<string, number> = { build: 0, consider: 1, dont_build: 2 }
          return (order[a.recommendation] ?? 3) - (order[b.recommendation] ?? 3)
        }
        default:
          return 0
      }
    })

    return filtered
  }, [cases, searchQuery, sortBy, activeFilter])

  const sortLabels: Record<SortOption, string> = {
    name: 'Name',
    date: 'Date',
    status: 'Status',
  }

  // Collapsed state
  if (sidebarCollapsed) {
    return (
      <motion.div 
        initial={{ width: 280 }}
        animate={{ width: 56 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="h-full flex flex-col bg-surface/50"
      >
        {/* Expand button */}
        <div className="p-2.5 flex justify-center">
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-surface-raised transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft className="w-4 h-4 text-ink-muted" />
          </button>
        </div>
        
        {/* New case button */}
        <div className="px-2.5 pb-3 flex justify-center">
          <button
            onClick={onNewCase}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-ink/5 hover:bg-ink/8 transition-colors"
            title="New case"
          >
            <Plus className="w-4 h-4 text-brand" />
          </button>
        </div>

        {/* Compact case list */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredAndSortedCases.map((c) => {
            const isSelected = selectedCaseId === c.id

            return (
              <button
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className={cn(
                  'w-full py-2 flex items-center justify-center transition-all duration-100 relative group',
                  isSelected
                    ? 'bg-ink/3'
                    : 'hover:bg-surface-raised'
                )}
                title={`${c.clientName} — ${getRecommendationLabel(c.recommendation)}`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-brand rounded-r-full" />
                )}
                <div className="relative">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold',
                      c.recommendation === 'build' && 'bg-emerald-500/10 text-emerald-600',
                      c.recommendation === 'consider' && 'bg-amber-500/10 text-amber-600',
                      c.recommendation === 'dont_build' && 'bg-red-500/10 text-red-600'
                    )}
                  >
                    {c.clientName.charAt(0)}
                  </div>
                  {c.recommendation === 'dont_build' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-3 flex justify-center">
          <span className="text-[10px] font-mono text-ink-muted">
            {filteredAndSortedCases.length}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ width: 56 }}
      animate={{ width: 280 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="h-full flex flex-col bg-surface/50"
    >
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-ink tracking-tight">
            Reports
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewCase}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-brand hover:bg-ink/5 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
            <button
              onClick={onToggleSidebar}
              className="p-1 rounded-md hover:bg-surface-raised transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4 text-ink-muted" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-surface-raised rounded-md text-[12px] text-ink placeholder:text-ink-muted focus:outline-none focus:bg-surface-raised/80 transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-all duration-100',
                activeFilter === chip.id
                  ? 'bg-brand text-brand-foreground'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
              )}
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}
        </div>

        {/* Sort row */}
        <div className="flex items-center justify-between pt-1">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink-muted transition-colors"
            >
              Sort by: <span className="text-ink/80 font-medium">{sortLabels[sortBy]}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortMenu(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-full left-0 mt-1 py-1 bg-popover rounded-md shadow-lg z-20 min-w-[100px]"
                  >
                    {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option)
                          setShowSortMenu(false)
                        }}
                        className={cn(
                          'w-full px-3 py-1.5 text-left text-[11px] transition-colors',
                          sortBy === option
                            ? 'bg-ink/5 text-brand'
                            : 'text-ink hover:bg-surface-raised'
                        )}
                      >
                        {sortLabels[option]}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <span className="text-[11px] text-ink-muted">
            {filteredAndSortedCases.length} {filteredAndSortedCases.length === 1 ? 'report' : 'reports'}
          </span>
        </div>
      </div>

      {/* Case list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedCases.map((c) => {
            const isSelected = selectedCaseId === c.id

            return (
              <motion.button
                key={c.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.1 }}
                onClick={() => onSelectCase(c.id)}
                className={cn(
                  'w-full px-4 py-3 text-left transition-all duration-100 relative group',
                  isSelected
                    ? 'bg-ink/3'
                    : 'hover:bg-surface-raised/60'
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-brand rounded-r-full" />
                )}
                
                <div className="flex items-start gap-2.5">
                  {/* Recommendation indicator dot */}
                  <div className="mt-1.5">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        getRecommendationDotClasses(c.recommendation)
                      )}
                    />
                  </div>

                  {/* Case info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-[13px] font-medium text-ink truncate">
                          {c.clientName}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 px-1.5 py-0.5 text-[9px] font-medium rounded',
                          getRecommendationBadgeClasses(c.recommendation)
                        )}
                      >
                        {getRecommendationLabel(c.recommendation)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[11px] text-ink-muted">
                        Created {formatRelativeTime(c.createdAt)}
                      </span>
                      <span className="text-[10px] text-ink-muted font-mono">
                        {formatRelativeTime(c.updatedAt)}
                      </span>
                    </div>

                    {/* Minimal status bar */}
                    <div className="mt-2 h-[3px] bg-surface-raised rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: c.recommendation === 'build' ? '100%' : c.recommendation === 'consider' ? '60%' : '20%' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          c.recommendation === 'build' && 'bg-emerald-500',
                          c.recommendation === 'consider' && 'bg-amber-500',
                          c.recommendation === 'dont_build' && 'bg-red-500'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {filteredAndSortedCases.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-ink-muted text-[12px] mb-3">
              {searchQuery ? `No reports found for "${searchQuery}"` : 'No reports match this filter'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewCase}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-brand hover:bg-ink/5 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Analysis
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 bg-surface-raised/40">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-ink-muted">
            {filteredAndSortedCases.length} {filteredAndSortedCases.length === 1 ? 'report' : 'reports'}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {cases.filter(c => c.recommendation === 'build').length}
            </span>
            <span className="flex items-center gap-0.5 text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {cases.filter(c => c.recommendation === 'consider').length}
            </span>
            <span className="flex items-center gap-0.5 text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {cases.filter(c => c.recommendation === 'dont_build').length}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
