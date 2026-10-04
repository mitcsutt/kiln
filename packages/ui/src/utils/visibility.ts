import styles from './visibility.module.css'

/** Breakpoints you can hide at (mobile-first, same as utils/responsive.ts). */
export type VisibilityBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

export interface VisibilityProps {
  /** Hide below this breakpoint (e.g. `md` → hidden on phones, shown from 48em). */
  hideBelow?: VisibilityBreakpoint
  /** Hide from this breakpoint up (e.g. `md` → shown on phones only). */
  hideAbove?: VisibilityBreakpoint
}

const below: Record<VisibilityBreakpoint, string | undefined> = {
  sm: styles.hideBelowSm,
  md: styles.hideBelowMd,
  lg: styles.hideBelowLg,
  xl: styles.hideBelowXl,
}
const above: Record<VisibilityBreakpoint, string | undefined> = {
  sm: styles.hideAboveSm,
  md: styles.hideAboveMd,
  lg: styles.hideAboveLg,
  xl: styles.hideAboveXl,
}

/**
 * Class names for responsive visibility. Components that accept `VisibilityProps`
 * pass the result through `cx()`. Hidden means `display: none` (removed from the
 * accessibility tree too) — for screen-reader-only content use <VisuallyHidden>.
 */
export function visibilityClass({ hideBelow, hideAbove }: VisibilityProps): string | undefined {
  const classes = [
    hideBelow ? below[hideBelow] : undefined,
    hideAbove ? above[hideAbove] : undefined,
  ].filter(Boolean)
  return classes.length ? classes.join(' ') : undefined
}
