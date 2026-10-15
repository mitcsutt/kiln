/*! @license
 * Vendored from react-grid-layout 2.3.0 (src/core/sort.ts), MIT licence.
 * Copyright (c) 2016 Samuel Reed. See ./LICENSE.
 * https://github.com/react-grid-layout/react-grid-layout/tree/2.3.0/src/core
 */

/* Kiln's changes: formatting, and no `'wrap'` compaction. */

import type { CompactType, Layout, LayoutItem } from './types'

/**
 * Sort layout items based on the compaction type.
 *
 * - Vertical compaction: sort by row (y) then column (x)
 * - Horizontal compaction: sort by column (x) then row (y)
 * - No compaction (null): return original order
 *
 * Does not modify the original layout.
 */
export function sortLayoutItems(layout: Layout, compactType: CompactType): LayoutItem[] {
  if (compactType === 'horizontal') {
    return sortLayoutItemsByColRow(layout)
  }
  if (compactType === 'vertical') {
    return sortLayoutItemsByRowCol(layout)
  }
  // No compaction - return a copy to maintain immutability
  return [...layout]
}

/** Sort layout items by row ascending, then column ascending. */
export function sortLayoutItemsByRowCol(layout: Layout): LayoutItem[] {
  return [...layout].sort((a, b) => {
    // Primary sort by row (y)
    if (a.y !== b.y) {
      return a.y - b.y
    }
    // Secondary sort by column (x)
    return a.x - b.x
  })
}

/** Sort layout items by column ascending, then row ascending. */
export function sortLayoutItemsByColRow(layout: Layout): LayoutItem[] {
  return [...layout].sort((a, b) => {
    // Primary sort by column (x)
    if (a.x !== b.x) {
      return a.x - b.x
    }
    // Secondary sort by row (y)
    return a.y - b.y
  })
}
