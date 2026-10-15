/*! @license
 * Vendored from react-grid-layout 2.3.0 (src/core/compactors.ts), MIT licence.
 * Copyright (c) 2016 Samuel Reed. See ./LICENSE.
 * https://github.com/react-grid-layout/react-grid-layout/tree/2.3.0/src/core
 */

/*
 * Kiln's changes: formatting; no overlap-allowing compactors and no `preventCollision`
 * option on `getCompactor` (Kiln uses neither).
 */

import { collides, getFirstCollision } from './collision'
import { bottom, cloneLayout, cloneLayoutItem, getStatics } from './layout'
import { sortLayoutItemsByColRow, sortLayoutItemsByRowCol } from './sort'
import type { Compactor, CompactType, Layout, LayoutItem, Mutable } from './types'

/**
 * Resolve a compaction collision by moving items.
 *
 * Before moving an item to a position, checks if that movement would
 * cause collisions and recursively moves those items first.
 *
 * @param layout - Full layout (must be sorted for optimization)
 * @param item - Item being moved (will be mutated)
 * @param moveToCoord - Target coordinate
 * @param axis - Which axis to move on ('x' or 'y')
 * @param hasStatics - Whether layout contains static items (disables early break optimization)
 */
export function resolveCompactionCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: 'x' | 'y',
  hasStatics?: boolean,
): void {
  const sizeProp = axis === 'x' ? 'w' : 'h'

  // Temporarily increment position to check for collisions
  ;(item as Mutable<LayoutItem>)[axis] += 1

  const itemIndex = layout.findIndex((l) => l.i === item.i)

  // Calculate hasStatics once if not provided (for backwards compat)
  const layoutHasStatics = hasStatics ?? getStatics(layout).length > 0

  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i]
    if (otherItem === undefined) continue
    if (otherItem.static) continue
    // Optimization: break early if past this element, but only if no statics
    // are present. Static items can be scattered throughout the layout,
    // so we can't assume sort order guarantees no more collisions.
    if (!layoutHasStatics && otherItem.y > item.y + item.h) break

    if (collides(item, otherItem)) {
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProp],
        axis,
        layoutHasStatics,
      )
    }
  }

  ;(item as Mutable<LayoutItem>)[axis] = moveToCoord
}

/**
 * Compact a single item vertically (move up).
 *
 * Moves the item as far up as possible without colliding.
 *
 * @param compareWith - Items to check for collisions
 * @param l - Item to compact (will be mutated)
 * @param fullLayout - Full layout for collision resolution
 * @param maxY - Maximum Y to start from
 */
export function compactItemVertical(
  compareWith: Layout,
  l: LayoutItem,
  fullLayout: Layout,
  maxY: number,
): LayoutItem {
  // Correct negative positions first
  ;(l as Mutable<LayoutItem>).x = Math.max(l.x, 0)
  ;(l as Mutable<LayoutItem>).y = Math.max(l.y, 0)

  // Limit Y to the current bottom
  ;(l as Mutable<LayoutItem>).y = Math.min(maxY, l.y)

  // Move up as far as possible
  while (l.y > 0 && !getFirstCollision(compareWith, l)) {
    ;(l as Mutable<LayoutItem>).y--
  }

  // Resolve collisions by moving down
  let collision: LayoutItem | undefined
  while ((collision = getFirstCollision(compareWith, l)) !== undefined) {
    resolveCompactionCollision(fullLayout, l, collision.y + collision.h, 'y')
  }

  ;(l as Mutable<LayoutItem>).y = Math.max(l.y, 0)
  return l
}

/**
 * Compact a single item horizontally (move left).
 *
 * Moves the item as far left as possible without colliding.
 * Wraps to the next row if it overflows.
 *
 * @param compareWith - Items to check for collisions
 * @param l - Item to compact (will be mutated)
 * @param cols - Number of columns in the grid
 * @param fullLayout - Full layout for collision resolution
 */
export function compactItemHorizontal(
  compareWith: Layout,
  l: LayoutItem,
  cols: number,
  fullLayout: Layout,
): LayoutItem {
  // Correct negative positions first
  ;(l as Mutable<LayoutItem>).x = Math.max(l.x, 0)
  ;(l as Mutable<LayoutItem>).y = Math.max(l.y, 0)

  // Move left as far as possible
  while (l.x > 0 && !getFirstCollision(compareWith, l)) {
    ;(l as Mutable<LayoutItem>).x--
  }

  // Resolve collisions
  let collision: LayoutItem | undefined
  while ((collision = getFirstCollision(compareWith, l)) !== undefined) {
    resolveCompactionCollision(fullLayout, l, collision.x + collision.w, 'x')

    // Horizontal overflow: wrap to next row
    if (l.x + l.w > cols) {
      ;(l as Mutable<LayoutItem>).x = cols - l.w
      ;(l as Mutable<LayoutItem>).y++

      while (l.x > 0 && !getFirstCollision(compareWith, l)) {
        ;(l as Mutable<LayoutItem>).x--
      }
    }
  }

  ;(l as Mutable<LayoutItem>).x = Math.max(l.x, 0)
  return l
}

/**
 * Vertical compactor - moves items up to fill gaps.
 *
 * Items are sorted by row then column, and each item is moved
 * as far up as possible without overlapping other items.
 */
export const verticalCompactor: Compactor = {
  type: 'vertical',
  allowOverlap: false,

  compact(layout: Layout): Layout {
    const compareWith = getStatics(layout)
    let maxY = bottom(compareWith)
    const sorted = sortLayoutItemsByRowCol(layout)
    const out: LayoutItem[] = new Array<LayoutItem>(layout.length)

    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i]
      if (sortedItem === undefined) continue

      let l = cloneLayoutItem(sortedItem)

      if (!l.static) {
        l = compactItemVertical(compareWith, l, sorted, maxY)
        maxY = Math.max(maxY, l.y + l.h)
        compareWith.push(l)
      }

      const originalIndex = layout.indexOf(sortedItem)
      out[originalIndex] = l
      l.moved = false
    }

    return out
  },
}

/**
 * Horizontal compactor - moves items left to fill gaps.
 *
 * Items are sorted by column then row, and each item is moved
 * as far left as possible without overlapping other items.
 */
export const horizontalCompactor: Compactor = {
  type: 'horizontal',
  allowOverlap: false,

  compact(layout: Layout, cols: number): Layout {
    const compareWith = getStatics(layout)
    const sorted = sortLayoutItemsByColRow(layout)
    const out: LayoutItem[] = new Array<LayoutItem>(layout.length)

    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i]
      if (sortedItem === undefined) continue

      let l = cloneLayoutItem(sortedItem)

      if (!l.static) {
        l = compactItemHorizontal(compareWith, l, cols, sorted)
        compareWith.push(l)
      }

      const originalIndex = layout.indexOf(sortedItem)
      out[originalIndex] = l
      l.moved = false
    }

    return out
  },
}

/**
 * No compaction - items stay where placed.
 *
 * Use this for free-form layouts where items can be placed anywhere.
 */
export const noCompactor: Compactor = {
  type: null,
  allowOverlap: false,

  compact(layout: Layout): Layout {
    // No compaction - just clone to maintain immutability
    return cloneLayout(layout)
  },
}

/** Get a compactor by type. */
export function getCompactor(compactType: CompactType): Compactor {
  if (compactType === 'vertical') return verticalCompactor
  if (compactType === 'horizontal') return horizontalCompactor
  return noCompactor
}
