'use client'

import { useEffect, useCallback } from 'react'

// GitHub-style keyboard navigation for the admin shell.
// Press `g` then a letter to jump to a section.
// Press `?` to show the shortcuts help (toggles a class on body).
// Press `/` to focus search (handled by SearchInput).

const SHORTCUTS: Record<string, string> = {
  o: '/admin',           // Overview
  c: '/admin/customers',
  r: '/admin/organizations',
  s: '/admin/subscriptions',
  p: '/admin/payments',
  e: '/admin/entitlements',
  v: '/admin/events',    // eVents
  a: '/admin/audit',
  h: '/admin/system',    // Health
  q: '/admin/qa',
  g: '/admin/settings',
}

export function useKeyboardNav() {
  const handleKey = useCallback((e: KeyboardEvent) => {
    // Only fire if not typing in an input/textarea/select
    const target = e.target as HTMLElement
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
      return
    }
    // ?  — toggle help
    if (e.key === '?') {
      e.preventDefault()
      document.body.classList.toggle('vcp-kbd-help-visible')
      return
    }
    // Escape — close help
    if (e.key === 'Escape') {
      document.body.classList.remove('vcp-kbd-help-visible')
      return
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])
}

// Separate component that listens for the `g` prefix + next key
export function KeyboardNavHandler() {
  useEffect(() => {
    let waitingForSecondKey = false
    let timeout: ReturnType<typeof setTimeout> | null = null

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return
      }

      if (e.key === 'g' && !waitingForSecondKey) {
        waitingForSecondKey = true
        // Show a subtle "g pressed" indicator
        document.body.classList.add('vcp-kbd-g-pressed')
        // Auto-cancel after 800ms
        timeout = setTimeout(() => {
          waitingForSecondKey = false
          document.body.classList.remove('vcp-kbd-g-pressed')
        }, 800)
        e.preventDefault()
        return
      }

      if (waitingForSecondKey) {
        const dest = SHORTCUTS[e.key.toLowerCase()]
        if (dest) {
          e.preventDefault()
          window.location.href = dest
        }
        waitingForSecondKey = false
        document.body.classList.remove('vcp-kbd-g-pressed')
        if (timeout) clearTimeout(timeout)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  return null
}

// A help overlay that shows all shortcuts when `?` is pressed
export function KeyboardHelpOverlay() {
  const shortcuts: { keys: string; label: string }[] = [
    { keys: 'g o', label: 'Overview' },
    { keys: 'g c', label: 'Customers' },
    { keys: 'g r', label: 'Organizations' },
    { keys: 'g s', label: 'Subscriptions' },
    { keys: 'g p', label: 'Payments' },
    { keys: 'g e', label: 'Entitlements' },
    { keys: 'g v', label: 'System Events' },
    { keys: 'g a', label: 'Audit Log' },
    { keys: 'g h', label: 'System Health' },
    { keys: 'g q', label: 'Founder QA' },
    { keys: 'g g', label: 'Settings' },
    { keys: '/', label: 'Search' },
    { keys: '?', label: 'Show/hide this help' },
    { keys: 'Esc', label: 'Close help' },
  ]

  return (
    <div
      className="vcp-kbd-help"
      role="dialog"
      aria-label="Keyboard shortcuts"
      onClick={(e) => { if (e.target === e.currentTarget) document.body.classList.remove('vcp-kbd-help-visible') }}
    >
      <div className="vcp-kbd-help-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[var(--vcp-ink-strong)]">Keyboard shortcuts</h3>
          <button
            onClick={() => document.body.classList.remove('vcp-kbd-help-visible')}
            className="text-[var(--vcp-ink-faint)] hover:text-[var(--vcp-ink)] vcp-focus rounded p-1"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-[var(--vcp-ink-muted)]">{s.label}</span>
              <kbd className="vcp-kbd-key">{s.keys}</kbd>
            </div>
          ))}
        </div>
        <p className="mt-5 pt-4 border-t border-[var(--vcp-border)] text-[11px] text-[var(--vcp-ink-faint)]">
          Press <kbd className="vcp-kbd-key-inline">g</kbd> then a letter to jump to a section. Press <kbd className="vcp-kbd-key-inline">?</kbd> any time to show this help.
        </p>
      </div>
    </div>
  )
}
