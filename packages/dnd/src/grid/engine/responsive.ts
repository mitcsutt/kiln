/*! @license
 * Vendored from react-grid-layout 2.3.0 (src/core/responsive.ts), MIT licence.
 * Copyright (c) 2016 Samuel Reed. See ./LICENSE.
 * https://github.com/react-grid-layout/react-grid-layout/tree/2.3.0/src/core
 */

/* Kiln's changes: formatting; only the functions Kiln calls. */

import { getCompactor } from './compactors'
import { cloneLayout, correctBounds } from './layout'
import type {
  Breakpoint,
  Breakpoints,
  Compactor,
  CompactType,
  Layout,
  ResponsiveLayouts,
} from './types'

/**
 * Sort breakpoints by width (ascending).
 *
 * Returns an array of breakpoint names sorted from smallest to largest.
 */
export function sortBreakpoints<B extends Breakpoint>(breakpoints: Breakpoints<B>): B[] {
  const keys = Object.keys(breakpoints) as B[]
  return keys.sort((a, b) => breakpoints[a] - breakpoints[b])
}

/**
 * Get the active breakpoint for a given width.
 *
 * Returns the highest breakpoint that is valid for the width (width > breakpoint).
 */
export function getBreakpointFromWidth<B extends Breakpoint>(
  breakpoints: Breakpoints<B>,
  width: number,
): B {
  const sorted = sortBreakpoints(breakpoints)
  let matching = sorted[0]

  if (matching === undefined) {
    throw new Error('No breakpoints defined')
  }

  for (let i = 1; i < sorted.length; i++) {
    const breakpointName = sorted[i]
    if (breakpointName === undefined) continue

    const breakpointWidth = breakpoints[breakpointName]
    if (width > breakpointWidth) {
      matching = breakpointName
    }
  }

  return matching
}

/**
 * Find or generate a layout for a breakpoint.
 *
 * If a layout exists for the breakpoint, returns a clone.
 * Otherwise, generates a new layout from the nearest larger breakpoint.
 *
 * @param layouts - Existing layouts by breakpoint
 * @param breakpoints - Breakpoint definitions
 * @param breakpoint - Target breakpoint
 * @param lastBreakpoint - Previous breakpoint (for fallback)
 * @param cols - Column count for the target breakpoint
 * @param compactTypeOrCompactor - Compaction type string (legacy) or Compactor object
 */
export function findOrGenerateResponsiveLayout<B extends Breakpoint>(
  layouts: ResponsiveLayouts<B>,
  breakpoints: Breakpoints<B>,
  breakpoint: B,
  lastBreakpoint: B,
  cols: number,
  compactTypeOrCompactor: CompactType | Compactor,
): Layout {
  // If it already exists, just return it
  const existingLayout = layouts[breakpoint]
  if (existingLayout) {
    return cloneLayout(existingLayout)
  }

  // Find or generate the next layout
  let layout = layouts[lastBreakpoint]

  // Look for layouts at larger breakpoints
  const breakpointsSorted = sortBreakpoints(breakpoints)
  const breakpointsAbove = breakpointsSorted.slice(breakpointsSorted.indexOf(breakpoint))

  for (let i = 0; i < breakpointsAbove.length; i++) {
    const b = breakpointsAbove[i]
    if (b === undefined) continue

    const layoutForBreakpoint = layouts[b]
    if (layoutForBreakpoint) {
      layout = layoutForBreakpoint
      break
    }
  }

  // Clone layout so we don't modify existing items
  const clonedLayout = cloneLayout(layout ?? [])

  // Correct bounds and compact - use compactor.compact() (#2213)
  // Handle both legacy compactType string and new Compactor object
  const corrected = correctBounds(clonedLayout, { cols })
  const compactor: Compactor =
    typeof compactTypeOrCompactor === 'object' && compactTypeOrCompactor !== null
      ? compactTypeOrCompactor
      : getCompactor(compactTypeOrCompactor)
  return compactor.compact(corrected, cols)
}
