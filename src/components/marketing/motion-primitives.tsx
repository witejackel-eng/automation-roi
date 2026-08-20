'use client';

/**
 * Motion primitives — shared Framer Motion wrappers for marketing sections.
 *
 * FadeIn: scroll-triggered fade + rise (whileInView, once).
 * HoverLift: subtle translateY + shadow lift on hover.
 *
 * These are used by landing-view.tsx (the /start landing page) and other
 * marketing-adjacent views.
 */
import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

// ── FadeIn ────────────────────────────────────────────────────────────────

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before the animation starts. */
  delay?: number;
  /** Render as a different element (default: div). */
  as?: 'div' | 'section' | 'span';
  /** Optional onAnimationComplete callback. */
  onComplete?: () => void;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  as = 'div',
  onComplete,
}: FadeInProps) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      variants={fadeInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={cn(className)}
      onAnimationComplete={onComplete}
    >
      {children}
    </MotionTag>
  );
}

// ── HoverLift ──────────────────────────────────────────────────────────────

interface HoverLiftProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverLift({ children, className }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
