/*! @license
 * Vendored from react-grid-layout 2.3.0 (src/core/layout.ts), MIT licence.
 * Copyright (c) 2016 Samuel Reed. See ./LICENSE.
 * https://github.com/react-grid-layout/react-grid-layout/tree/2.3.0/src/core
 */

/*
 * Kiln's changes: formatting; only the functions Kiln calls; `cloneLayoutItem` copies
 * every field (a consumer's own fields survive a move) instead of a fixed list, and
 * leaves `moved` and `static` as they were rather than normalising them to booleans;
 * no `'wrap'` compaction.
 */

import { getAllCollisions, getFirstCollision } from './collision'
import { sortLayoutItems } from './sort'
import type { CompactType, Layout, LayoutItem, Mutable } from './types'

/**
 * Get the bottom-most Y coordinate of the layout.
 *
 * This is the Y position plus height of the lowest item.
 */
export function bottom(layout: Layout): number {
  let max = 0
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i]
    if (item !== undefined) {
      const bottomY = item.y + item.h
      if (bottomY > max) max = bottomY
    }
  }
  return max
}

/** Get a layout item by its ID. */
export function getLayoutItem(layout: Layout, id: string): LayoutItem | undefined {
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i]
    if (item !== undefined && item.i === id) {
      return item
    }
  }
  return undefined
}

/**
 * Get all static items from the layout.
 *
 * Static items cannot be moved or resized by the user.
 */
export function getStatics(layout: Layout): LayoutItem[] {
  return layout.filter((l): l is LayoutItem => l.static === true)
}

/** Clone a layout item (a shallow copy with every property preserved). */
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  return { ...layoutItem }
}

/** Clone an entire layout. */
export function cloneLayout(layout: Layout): LayoutItem[] {
  const newLayout: LayoutItem[] = new Array<LayoutItem>(layout.length)
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i]
    if (item !== undefined) {
      newLayout[i] = cloneLayoutItem(item)
    }
  }
  return newLayout
}

/**
 * Ensure all layout items fit within the grid bounds.
 *
 * - Items overflowing right are moved left
 * - Items overflowing left are moved to x=0 and clamped to grid width
 * - Static items that collide with other statics are moved down
 *
 * **IMPORTANT**: This function mutates the layout items in place for performance.
 * Clone the layout first (e.g., with `cloneLayout()`) if you need immutability.
 */
export function correctBounds(
  layout: Mutable<LayoutItem>[],
  bounds: { cols: number },
): LayoutItem[] {
  const collidesWith = getStatics(layout)

  for (let i = 0; i < layout.length; i++) {
    const l = layout[i]
    if (l === undefined) continue

    // Overflows right
    if (l.x + l.w > bounds.cols) {
      l.x = bounds.cols - l.w
    }

    // Overflows left
    if (l.x < 0) {
      l.x = 0
      l.w = bounds.cols
    }

    // y: Infinity (a common "append to bottom" convention) must not survive
    // into rendering math, or the item renders at the top-left and overlaps.
    // Clamp it to the current bottom of the layout (#2161).
    if (l.y === Infinity) {
      l.y = bottom(collidesWith)
    }

    if (!l.static) {
      collidesWith.push(l)
    } else {
      // Static items that collide with other statics must be moved down
      while (getFirstCollision(collidesWith, l)) {
        l.y++
      }
    }
  }

  return layout
}

/**
 * Move a layout element to a new position.
 *
 * Handles collision detection and cascading movements.
 * Does not compact the layout - call `compact()` separately.
 *
 * **Note**: This function mutates the `l` parameter directly for performance.
 * The item's x, y, and moved properties will be modified. Callers should
 * pass a cloned item if they need to preserve the original.
 *
 * @param layout - Full layout
 * @param l - Item to move (will be mutated)
 * @param x - New X position (or undefined to keep current)
 * @param y - New Y position (or undefined to keep current)
 * @param isUserAction - True if this is a direct user action (affects collision resolution)
 * @param preventCollision - True to block movement into occupied space (item snaps back). No effect if allowOverlap is true.
 * @param compactType - Compaction type for collision resolution
 * @param cols - Number of columns in the grid
 * @param allowOverlap - True to allow items to stack on top of each other
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  x: number | undefined,
  y: number | undefined,
  isUserAction: boolean | undefined,
  preventCollision: boolean | undefined,
  compactType: CompactType,
  cols: number,
  allowOverlap?: boolean,
): LayoutItem[] {
  // Static items can't be moved unless explicitly draggable
  if (l.static && l.isDraggable !== true) {
    return [...layout]
  }

  // Short-circuit if position unchanged
  if (l.y === y && l.x === x) {
    return [...layout]
  }

  const oldX = l.x
  const oldY = l.y

  // Update position (mutates l directly - see JSDoc note)
  if (typeof x === 'number') (l as Mutable<LayoutItem>).x = x
  if (typeof y === 'number') (l as Mutable<LayoutItem>).y = y
  ;(l as Mutable<LayoutItem>).moved = true

  // Sort for proper collision detection order
  let sorted = sortLayoutItems(layout, compactType)
  const movingUp =
    compactType === 'vertical' && typeof y === 'number'
      ? oldY >= y
      : compactType === 'horizontal' && typeof x === 'number'
        ? oldX >= x
        : false

  if (movingUp) {
    sorted = sorted.reverse()
  }

  const collisions = getAllCollisions(sorted, l)
  const hasCollisions = collisions.length > 0

  // Handle overlap mode - just clone and return
  if (hasCollisions && allowOverlap) {
    return cloneLayout(layout)
  }

  // Handle prevent collision mode - revert position
  // Return same reference to signal no change occurred
  if (hasCollisions && preventCollision) {
    ;(l as Mutable<LayoutItem>).x = oldX
    ;(l as Mutable<LayoutItem>).y = oldY
    ;(l as Mutable<LayoutItem>).moved = false
    return layout as LayoutItem[]
  }

  // Resolve collisions by moving other items
  let resultLayout: LayoutItem[] = [...layout]
  for (let i = 0; i < collisions.length; i++) {
    const collision = collisions[i]
    if (collision === undefined) continue

    // Skip already-moved items to prevent infinite loops
    if (collision.moved) continue

    // Static items can't be moved - move the dragged item instead
    if (collision.static) {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        collision,
        l,
        isUserAction,
        compactType,
        cols,
      )
    } else {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        l,
        collision,
        isUserAction,
        compactType,
        cols,
      )
    }
  }

  return resultLayout
}

/**
 * Move an item away from a collision.
 *
 * Attempts to move the item up/left first if there's room,
 * otherwise moves it down/right.
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction: boolean | undefined,
  compactType: CompactType,
  cols: number,
): LayoutItem[] {
  const compactH = compactType === 'horizontal'
  const compactV = compactType === 'vertical'
  const preventCollision = collidesWith.static

  // Try to move up/left first (only on primary collision from user action)
  if (isUserAction) {
    isUserAction = false // Only try this once

    // Create a fake item to test if there's room above/left
    const fakeItem: LayoutItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1',
    }

    const firstCollision = getFirstCollision(layout, fakeItem)
    const collisionNorth =
      firstCollision !== undefined && firstCollision.y + firstCollision.h > collidesWith.y
    const collisionWest =
      firstCollision !== undefined && collidesWith.x + collidesWith.w > firstCollision.x

    // No collision above/left - we can move there
    if (!firstCollision) {
      return moveElement(
        layout,
        itemToMove,
        compactH ? fakeItem.x : undefined,
        compactV ? fakeItem.y : undefined,
        isUserAction,
        preventCollision,
        compactType,
        cols,
      )
    }

    // Handle specific collision cases
    if (collisionNorth && compactV) {
      return moveElement(
        layout,
        itemToMove,
        undefined,
        itemToMove.y + 1,
        isUserAction,
        preventCollision,
        compactType,
        cols,
      )
    }

    if (collisionNorth && compactType === null) {
      // Swap positions in free-form mode (#1982). The collider takes the dragged
      // item's y; the dragged item sits just below the collider's new bottom edge
      // (which equals the dragged item's y plus its height), so a partial overlap
      // resolves tight instead of shoving a full item height down and leaving a gap.
      const newCollidesY = itemToMove.y
      ;(collidesWith as Mutable<LayoutItem>).y = newCollidesY
      ;(itemToMove as Mutable<LayoutItem>).y = newCollidesY + collidesWith.h
      return [...layout]
    }

    if (collisionWest && compactH) {
      return moveElement(
        layout,
        collidesWith,
        itemToMove.x,
        undefined,
        isUserAction,
        preventCollision,
        compactType,
        cols,
      )
    }
  }

  // Default: move down/right by 1
  const newX = compactH ? itemToMove.x + 1 : undefined
  const newY = compactV ? itemToMove.y + 1 : undefined

  if (newX === undefined && newY === undefined) {
    return [...layout]
  }

  return moveElement(
    layout,
    itemToMove,
    newX,
    newY,
    isUserAction,
    preventCollision,
    compactType,
    cols,
  )
}
