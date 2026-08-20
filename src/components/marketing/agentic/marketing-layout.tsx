"use client"

import { ReactNode } from 'react'

interface MarketingLayoutProps {
  children: ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div
      className="text-[#111] min-h-screen font-sans antialiased"
      style={{
        backgroundColor: '#f5f4f1',
        // Override the dark canvas from globals.css for marketing pages
        // The marketing pages use their own light cream visual language
      }}
    >
      {children}
    </div>
  )
}
