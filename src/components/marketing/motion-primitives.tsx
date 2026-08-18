'use client';

/**
 * Viableo marketing motion system.
 *
 * Built on the `motion` package (motion/react). One consistent vocabulary
 * for every marketing surface:
 *
 *   - <FadeIn>           — scroll-triggered fade + rise (whileInView, once).
 *   - <StaggerGroup>     — container that staggers its <StaggerItem> children
 *                          on mount (page-load hero entrance) OR on scroll.
 *   - <StaggerItem>      — the child of a StaggerGroup.
 *   - <MotionCard>       — a wrapping motion.div with a subtle hover lift
 *                          (translateY + shadow) — used for premium cards.
 *   - <MotionButton>     — a wrapping motion.button with a soft hover lift.
 *
 * Design rules (per the elevation brief):
 *   - All animations are SUBTLE and FAST (0.4–0.7s).
 *   - Easing is premium: [0.16, 1, 0.3, 1] (ease-out-expo-ish).
 *   - No bouncing, no spring overshoot, no flashy effects.
 *   - Respects prefers-reduced-motion automatically (motion handles this).
 */
import * as React from 'react';
import { motion, type Variants, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

// ── Shared easing + timing tokens ──────────────────────────────────────
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const RISE = 16; // px — subtle upward movement on reveal
const DURATION = 0.56; // s — premium, fast, not sluggish
const STAGGER = 0.08; // s between staggered children

// ── Variants ───────────────────────────────────────────────────────────

/** Hidden state: invisible, nudged down a few pixels. */
const hidden = { opacity: 0, y: RISE };
/** Shown state: visible, at rest. */
const shown = { opacity: 1, y: 0 };

/** Variants for a single fade-in item. */
export const fadeInVariants: Variants = {
  hidden,
  visible: {
    ...shown,
    transition: { duration: DURATION, ease: EASE_OUT },
  },
};

/** Variants for a stagger container — orchestrates its children. */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER, delayChildren: 0.06 },
  },
};

/** Variants for a stagger child (used inside <StaggerGroup>). */
export const staggerItemVariants: Variants = {
  hidden,
  visible: {
    ...shown,
    transition: { duration: DURATION, ease: EASE_OUT },
  },
};

// ── Shared viewport config for whileInView ─────────────────────────────
const VIEWPORT_ONCE = { once: true, amount: 0.2 as const, margin: '0px 0px -8% 0px' };

// ── Components ─────────────────────────────────────────────────────────

type FadeInProps = HTMLMotionProps<'div'> & {
  /** Delay (seconds) before the fade starts after entering viewport. */
  delay?: number;
  /** Override the rise distance (px). Default 16. */
  y?: number;
  /** Render as a different element tag. Default 'div'. */
  as?: 'div' | 'section' | 'article' | 'li' | 'span' | 'p' | 'header' | 'footer' | 'main';
};

/**
 * FadeIn — scroll-triggered fade + rise.
 * Uses whileInView with once:true so it only animates the first time.
 * Respects reduced-motion automatically (motion handles it).
 */
export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(function FadeIn(
  { children, className, delay = 0, y = RISE, as = 'div', ...rest },
  ref
) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION, ease: EASE_OUT, delay },
        },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
});

type StaggerGroupProps = HTMLMotionProps<'div'> & {
  /** When true (default), animates on mount. Set false to trigger on scroll instead. */
  animateOnMount?: boolean;
  /** Override the stagger gap (seconds). */
  stagger?: number;
  /** Render as a different tag. */
  as?: 'div' | 'section' | 'ul' | 'ol' | 'header' | 'main';
};

/**
 * StaggerGroup — container that orchestrates its <StaggerItem> children.
 * By default animates on mount (hero entrance). Set animateOnMount={false}
 * to trigger on scroll via whileInView instead.
 */
export const StaggerGroup = React.forwardRef<HTMLDivElement, StaggerGroupProps>(
  function StaggerGroup(
    { children, className, animateOnMount = true, stagger = STAGGER, as = 'div', ...rest },
    ref
  ) {
    const MotionTag = motion[as] as typeof motion.div;
    const variants: Variants = {
      hidden: {},
      visible: {
        transition: { staggerChildren: stagger, delayChildren: 0.06 },
      },
    };
    const triggerProps = animateOnMount
      ? { initial: 'hidden' as const, animate: 'visible' as const }
      : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: VIEWPORT_ONCE };
    return (
      <MotionTag ref={ref} className={className} variants={variants} {...triggerProps} {...rest}>
        {children}
      </MotionTag>
    );
  }
);

type StaggerItemProps = HTMLMotionProps<'div'> & {
  as?: 'div' | 'section' | 'article' | 'li' | 'span' | 'p' | 'button' | 'a';
};

/**
 * StaggerItem — child of <StaggerGroup>. Inherits the parent's stagger
 * timing. Use the `as` prop to render as any tag.
 */
export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  function StaggerItem({ children, className, as = 'div', ...rest }, ref) {
    const MotionTag = motion[as] as typeof motion.div;
    return (
      <MotionTag
        ref={ref}
        className={className}
        variants={staggerItemVariants}
        {...rest}
      >
        {children}
      </MotionTag>
    );
  }
);

// ── Hover micro-interactions ────────────────────────────────────────────

type HoverLiftProps = HTMLMotionProps<'div'> & {
  /** translateY distance on hover (px). Default -3. */
  lift?: number;
  /** Render as a different tag. */
  as?: 'div' | 'section' | 'article' | 'li';
};

/**
 * HoverLift — a wrapping motion.div with a subtle hover lift + shadow.
 * For premium cards (decision cards, pricing cards, report mockups).
 * Does NOT animate on mount — only on hover. Pair with <FadeIn> or
 * <StaggerGroup> for the entrance.
 */
export const HoverLift = React.forwardRef<HTMLDivElement, HoverLiftProps>(function HoverLift(
  { children, className, lift = -3, as = 'div', ...rest },
  ref
) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      ref={ref}
      className={className}
      whileHover={{
        y: lift,
        transition: { duration: 0.22, ease: EASE_OUT },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
});

type ButtonLiftProps = HTMLMotionProps<'button'> & {
  /** translateY distance on hover (px). Default -1.5. */
  lift?: number;
};

/**
 * ButtonLift — a motion.button with a soft hover lift.
 * Used for the primary dark CTA so it gets a quiet, premium hover rise
 * that complements (rather than fights) the CSS hover on .mkt-cta-dark.
 */
export const ButtonLift = React.forwardRef<HTMLButtonElement, ButtonLiftProps>(
  function ButtonLift({ children, className, lift = -1.5, ...rest }, ref) {
    return (
      <motion.button
        ref={ref}
        className={className}
        whileHover={{
          y: lift,
          transition: { duration: 0.2, ease: EASE_OUT },
        }}
        whileTap={{ y: 0, transition: { duration: 0.1, ease: EASE_OUT } }}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

// Re-export motion + variants so consumers can compose freely.
export { motion };
export { EASE_OUT, RISE, DURATION, STAGGER };
