import {
  bottom,
  cloneLayout,
  getAllCollisions,
  getCompactor,
  getLayoutItem,
  moveElement,
  type CompactType,
  type LayoutItem,
} from '#grid/engine'

/**
 * One item of a grid layout, in grid units: column `x`, row `y`, `w` columns wide and `h`
 * rows tall. `i` matches the `id` of its `GridLayout.Item`. A layout is a plain array of
 * these, so it serialises as is; extra fields of your own are kept through every change.
 */
export interface GridItem {
  /** The item's id, matching `GridLayout.Item`'s `id`. */
  i: string
  /** Column, from 0. */
  x: number
  /** Row, from 0. */
  y: number
  /** Width in columns. */
  w: number
  /** Height in rows. */
  h: number
  /** The narrowest the item can be resized to, in columns. Default 1. */
  minW?: number
  /** The widest the item can be resized to, in columns. Default the grid's column count. */
  maxW?: number
  /** The shortest the item can be resized to, in rows. Default 1. */
  minH?: number
  /** The tallest the item can be resized to, in rows. Default no limit. */
  maxH?: number
  /** A fixed item: it can't be moved or resized, and other items flow around it. */
  static?: boolean
}

/**
 * How a grid closes gaps: `vertical` pulls items up (the default), `horizontal` pulls them
 * left, and `none` leaves them where they're put.
 */
export type GridCompaction = 'vertical' | 'horizontal' | 'none'

/** Options for {@link compact}, {@link appendItem} and {@link removeItem}. */
export interface CompactOptions {
  /** The grid's column count. */
  columns: number
  /** How gaps close. Default `vertical`. */
  compaction?: GridCompaction
}

export const compactType = (compaction: GridCompaction = 'vertical'): CompactType =>
  compaction === 'none' ? null : compaction

/** Drops the engine's bookkeeping (`moved`) so a layout handed out is the consumer's shape. */
export function toPublic<T extends GridItem>(layout: readonly LayoutItem[]): T[] {
  return layout.map((item) => {
    const rest = { ...item }
    delete rest.moved
    return rest as unknown as T
  })
}

/**
 * Closes the gaps in a layout and keeps every item inside the columns. Returns a new
 * layout in the same order; the input is left alone.
 *
 * @example
 * ```ts
 * compact([{ i: 'revenue', x: 0, y: 4, w: 6, h: 2 }], { columns: 12 })
 * // [{ i: 'revenue', x: 0, y: 0, w: 6, h: 2 }]
 * ```
 */
export function compact<T extends GridItem>(layout: readonly T[], options: CompactOptions): T[] {
  const { columns, compaction } = options
  const bounded = cloneLayout(layout).map((item) => clampToColumns(item, columns))
  return toPublic<T>(getCompactor(compactType(compaction)).compact(bounded, columns))
}

/**
 * Adds an item at the bottom of a layout, then compacts. `x` defaults to 0 and `w` is
 * clamped to the column count.
 *
 * @example
 * ```ts
 * appendItem(layout, { i: 'tickets', w: 4, h: 2 }, { columns: 12 })
 * ```
 */
export function appendItem<T extends GridItem>(
  layout: readonly T[],
  item: Omit<T, 'x' | 'y'> & { x?: number; y?: number },
  options: CompactOptions,
): T[] {
  const placed = { ...item, x: item.x ?? 0, y: bottom(layout) } as unknown as T
  return compact([...layout, placed], options)
}

/**
 * Removes the item with id `i` from a layout, then compacts so the gap closes.
 *
 * @example
 * ```ts
 * removeItem(layout, 'tickets', { columns: 12 })
 * ```
 */
export function removeItem<T extends GridItem>(
  layout: readonly T[],
  i: string,
  options: CompactOptions,
): T[] {
  return compact(
    layout.filter((item) => item.i !== i),
    options,
  )
}

function clampToColumns(item: LayoutItem, columns: number): LayoutItem {
  const w = Math.max(1, Math.min(item.w, columns))
  const x = Math.max(0, Math.min(item.x, columns - w))
  return { ...item, w, x, y: Math.max(0, item.y) }
}

/** The size limits that apply to an item in a grid of `columns`. */
export function sizeLimits(item: GridItem, columns: number) {
  const minW = Math.max(1, Math.min(item.minW ?? 1, columns))
  const maxW = Math.max(minW, Math.min(item.maxW ?? columns, columns))
  const minH = Math.max(1, item.minH ?? 1)
  const maxH = Math.max(minH, item.maxH ?? Infinity)
  return { minW, maxW, minH, maxH }
}

/**
 * The layout with item `i` moved to column `x`, row `y` (clamped to the grid), its
 * neighbours pushed out of the way and the result compacted. A pure function of the
 * committed layout, so a preview never drifts from what a drop would commit.
 */
export function moveInLayout<T extends GridItem>(
  layout: readonly T[],
  i: string,
  x: number,
  y: number,
  options: CompactOptions,
): T[] {
  const { columns, compaction } = options
  const working = cloneLayout(layout)
  const item = getLayoutItem(working, i)
  if (!item) return [...layout]
  const type = compactType(compaction)
  const nextX = Math.max(0, Math.min(x, columns - item.w))
  const moved = moveElement(working, item, nextX, Math.max(0, y), true, false, type, columns)
  return toPublic<T>(getCompactor(type).compact(moved, columns))
}

/**
 * The layout with item `i` resized to `w` × `h` (clamped to its limits and the columns)
 * and compacted, which pushes what it now covers out of the way. With no compaction, the
 * items it covers move down below it instead.
 */
export function resizeInLayout<T extends GridItem>(
  layout: readonly T[],
  i: string,
  w: number,
  h: number,
  options: CompactOptions,
): T[] {
  const { columns, compaction } = options
  const working = cloneLayout(layout)
  const item = getLayoutItem(working, i)
  if (!item) return [...layout]
  const limits = sizeLimits(item, columns)
  item.w = Math.max(limits.minW, Math.min(w, limits.maxW, columns - item.x))
  item.h = Math.max(limits.minH, Math.min(h, limits.maxH))
  const type = compactType(compaction)
  if (type === null) {
    for (const other of getAllCollisions(working, item)) {
      moveElement(working, other, other.x, item.y + item.h, false, false, null, columns)
    }
  }
  return toPublic<T>(getCompactor(type).compact(working, columns))
}

/** The number of rows a layout fills. */
export const layoutRows = (layout: readonly GridItem[]): number => bottom(layout)

/** Where a drag asks an item to be, in grid units: the preview is computed from this. */
export interface GridRequest {
  x: number
  y: number
  w: number
  h: number
}

/**
 * The layout a drag would commit: the committed layout with item `i` moved to the
 * requested cell, then resized to the requested size. Always computed from the committed
 * layout, never from the last preview, so moving back undoes a move exactly.
 */
export function previewLayout<T extends GridItem>(
  committed: readonly T[],
  i: string,
  request: GridRequest,
  options: CompactOptions,
): T[] {
  const item = committed.find((l) => l.i === i)
  if (!item) return [...committed]
  const moved = moveInLayout(committed, i, request.x, request.y, options)
  if (request.w === item.w && request.h === item.h) return moved
  return resizeInLayout(moved, i, request.w, request.h, options)
}

/**
 * One keyboard step: the nearest request in `direction` that actually moves item `i`.
 * Compaction can pull an item straight back (one row down, in a vertically compacted
 * grid, often lands where it started), so a step keeps going until the item's place
 * changes, the way a person would expect one key press to move it past its neighbour.
 * `null` when it can't move that way at all.
 */
export function stepInLayout<T extends GridItem>(
  committed: readonly T[],
  i: string,
  request: GridRequest,
  direction: 'up' | 'down' | 'left' | 'right',
  options: CompactOptions,
): { request: GridRequest; layout: T[] } | null {
  const now = previewLayout(committed, i, request, options).find((l) => l.i === i)
  if (!now) return null
  const limit = bottom(committed) + request.h + 1
  for (let k = 1; k <= limit; k++) {
    const next: GridRequest = { ...request }
    if (direction === 'down') next.y = now.y + k
    if (direction === 'up') next.y = now.y - k
    if (direction === 'left') next.x = now.x - k
    if (direction === 'right') next.x = now.x + k
    if (next.y < 0 || next.x < 0 || next.x + request.w > options.columns) return null
    const layout = previewLayout(committed, i, next, options)
    const moved = layout.find((l) => l.i === i)
    if (moved && (moved.x !== now.x || moved.y !== now.y)) return { request: next, layout }
  }
  return null
}
