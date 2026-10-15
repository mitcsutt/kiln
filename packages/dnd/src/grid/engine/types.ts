/*! @license
 * Vendored from react-grid-layout 2.3.0 (src/core/types.ts), MIT licence.
 * Copyright (c) 2016 Samuel Reed. See ./LICENSE.
 * https://github.com/react-grid-layout/react-grid-layout/tree/2.3.0/src/core
 */

/*
 * Kiln's changes: only the types the vendored functions use. `LayoutItem` drops the
 * per-item resize handles, bounds and constraints (Kiln resizes from one corner and by
 * keyboard, in grid units), and `CompactType` drops `'wrap'`.
 */

/** One item in a grid layout. Position and size are in grid units, not pixels. */
export interface LayoutItem {
  /** Unique identifier for this item */
  i: string
  /** X position in grid units (0-indexed from left) */
  x: number
  /** Y position in grid units (0-indexed from top) */
  y: number
  /** Width in grid units */
  w: number
  /** Height in grid units */
  h: number
  /** Minimum width in grid units */
  minW?: number
  /** Minimum height in grid units */
  minH?: number
  /** Maximum width in grid units */
  maxW?: number
  /** Maximum height in grid units */
  maxH?: number
  /**
   * If true, item cannot be dragged or resized, and other items
   * will move around it during compaction.
   */
  static?: boolean
  /** If true, a static item can still be dragged. */
  isDraggable?: boolean
  /**
   * Internal flag set during drag/resize operations to indicate
   * the item has moved from its original position.
   */
  moved?: boolean
}

/** A layout is a readonly array of layout items. Layouts are treated as immutable. */
export type Layout = readonly LayoutItem[]

/**
 * Type of compaction to apply to the layout.
 * - 'vertical': Items compact upward (default)
 * - 'horizontal': Items compact leftward
 * - null: No compaction (free-form positioning)
 */
export type CompactType = 'horizontal' | 'vertical' | null

/** A layout compaction strategy. */
export interface Compactor {
  /** Compaction type identifier */
  readonly type: CompactType
  /** Whether items can overlap (stack on top of each other). */
  readonly allowOverlap: boolean
  /** Compact the layout. */
  compact(layout: Layout, cols: number): Layout
}

/** Breakpoint name. */
export type Breakpoint = string

/** Map of breakpoint name to pixel width. */
export type Breakpoints<B extends Breakpoint = Breakpoint> = Record<B, number>

/** Map of breakpoint name to layout. */
export type ResponsiveLayouts<B extends Breakpoint = Breakpoint> = Partial<Record<B, Layout>>

/** Makes all properties in T mutable (removes readonly). */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
