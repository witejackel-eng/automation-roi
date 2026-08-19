'use client';

/**
 * MotionProvider — a thin client wrapper around motion/react's <MotionConfig>.
 *
 * Renders <MotionConfig reducedMotion="user"> so every motion/react animation
 * in the tree honours the OS prefers-reduced-motion setting (mandate P0-12, §I).
 *
 * This is a client component because MotionConfig is; it's kept thin so the
 * root layout.tsx can stay a server component (metadata + JSON-LD live there).
 */
import * as React from 'react';
import { MotionConfig } from 'motion/react';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  );
}
