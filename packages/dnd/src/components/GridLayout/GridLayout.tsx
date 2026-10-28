import { cx, type Space } from '@mitcsutt/kiln-ui'
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react'

import { Dnd } from '#components/Dnd'
import { HandleContext } from '#components/DragHandle'
import { useDndController, useIsomorphicLayoutEffect } from '#core/context'
import type { CustomBehavior, DndController, DragInput } from '#core/controller'
import type { EngineMove } from '#core/engineTypes'
import type { DndAnnouncements, GridPlace } from '#core/messages'
import { useDragSource } from '#core/useDragSource'
import {
  appendItem,
  compactType,
  fitLayout,
  previewLayout,
  stepInLayout,
  type GridCompaction,
  type GridItem,
  type GridRequest,
} from '#data/layout'
import {
  bottom,
  cloneLayout,
  correctBounds,
  findOrGenerateResponsiveLayout,
  getBreakpointFromWidth,
} from '#grid/engine'

import styles from './GridLayout.module.css'

/**
 * A width at which a grid's column count can change. They are Kiln's breakpoints
 * (`sm` 40em, `md` 48em, `lg` 64em, `xl` 80em), measured against the grid's own width
 * rather than the window's, so a grid in a narrow pane gets fewer columns.
 */
export type GridBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl'

const BREAKPOINT_EM: Record<GridBreakpoint, number> = { base: 0, sm: 40, md: 48, lg: 64, xl: 80 }

/** One change, as `GridLayout`'s `onChange` reports it. */
export interface GridChange {
  /** The id of the item that moved or was resized. */
  id: string
  /** How it was changed. */
  input: DragInput
}

export interface GridLayoutProps<T extends GridItem = GridItem> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** The layout: one `{ i, x, y, w, h }` per item. Pass with `onChange` to control it. */
  layout?: readonly T[]
  /** The starting layout for a grid that keeps its own. */
  defaultLayout?: readonly T[]
  /** Called once per drop that changes the layout, never during a drag. */
  onChange?: (layout: T[], change: GridChange) => void
  /**
   * The column count, or one per breakpoint (`{ base: 4, md: 8, lg: 12 }`). The layout you
   * store is for the widest; narrower ones are generated from it. Default 12.
   */
  columns?: number | Partial<Record<GridBreakpoint, number>>
  /** The height of one row, as a space step. Default 9. */
  rowHeight?: Space
  /** The gap between items, as a space step. Default 4. */
  gap?: Space
  /** How gaps close after a change. Default `vertical`. */
  compaction?: GridCompaction
  /** The grid's accessible name ("Sales dashboard"). */
  label: string
  /** Replace any of the words the grid says (see `Dnd`). */
  announcements?: Partial<DndAnnouncements>
}

export interface GridLayoutItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  /** Matches the `i` of the item's entry in the layout. */
  id: string
  /** The item's name, as announcements and its handle say it ("Revenue"). */
  label: string
  /** Hide the resize grip. Keyboard resizing stays available unless the item is static. */
  resizable?: boolean
}

/* ─── The grid's shared state ─────────────────────────────────────────────── */

interface Active {
  i: string
  mode: 'move' | 'resize'
  input: DragInput
  /** Where the item was when it was picked up, as it renders. */
  origin: GridItem
}

interface GridState {
  /** What renders: the layout for the current column count, or the drag's preview. */
  layout: readonly GridItem[]
  active: Active | null
  /** The item a pointer just dropped: it lands without a transition, from where it was let go. */
  landed: string | null
  editable: boolean
  register: (i: string) => () => void
  behavior: (i: string, mode: 'move' | 'resize', label: () => string) => CustomBehavior
  messages: () => DndAnnouncements
}

const GridContext = createContext<GridState | null>(null)

const placeOf = (item: GridItem, label: string): GridPlace => ({
  item: label,
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h,
})

function resolveColumns(columns: GridLayoutProps['columns']): [GridBreakpoint, number][] {
  if (typeof columns === 'number' || columns === undefined) return [['base', columns ?? 12]]
  const entries = (Object.keys(BREAKPOINT_EM) as GridBreakpoint[])
    .filter((key) => columns[key] !== undefined)
    .map((key): [GridBreakpoint, number] => [key, columns[key] ?? 1])
  return entries.length ? entries : [['base', 12]]
}

function GridLayoutRoot<T extends GridItem>(
  {
    layout,
    defaultLayout,
    onChange,
    columns,
    rowHeight = 9,
    gap = 4,
    compaction = 'vertical',
    label,
    announcements,
    className,
    style,
    children,
    ...rest
  }: GridLayoutProps<T>,
  forwardedRef: Ref<HTMLDivElement>,
) {
  return (
    <Dnd announcements={announcements}>
      <GridSurface
        ref={forwardedRef}
        {...rest}
        layout={layout}
        defaultLayout={defaultLayout}
        onChange={onChange as SurfaceProps['onChange']}
        columns={columns}
        rowHeight={rowHeight}
        gap={gap}
        compaction={compaction}
        label={label}
        className={className}
        style={style}
      >
        {children}
      </GridSurface>
    </Dnd>
  )
}

// The surface works on plain `GridItem`s; the root's generic `T` only types what the
// consumer gets back, and every item it hands out is one the consumer gave it.
type SurfaceProps = Omit<GridLayoutProps, 'announcements'> & {
  rowHeight: Space
  gap: Space
  compaction: GridCompaction
}

const GridSurface = forwardRef(function GridSurface(
  {
    layout,
    defaultLayout,
    onChange,
    columns,
    rowHeight,
    gap,
    compaction,
    label,
    className,
    style,
    children,
    ...rest
  }: SurfaceProps,
  forwardedRef: Ref<HTMLDivElement>,
) {
  const controller = useDndController('GridLayout')
  const [own, setOwn] = useState<readonly GridItem[]>(() => defaultLayout ?? [])
  const committed = layout ?? own

  /* Breakpoints: measured on the grid; the widest until it is measured (and on the server). */
  const steps = useMemo(() => resolveColumns(columns), [columns])
  const widest = useMemo((): [GridBreakpoint, number] => steps.at(-1) ?? ['base', 12], [steps])
  const [width, setWidth] = useState<number | null>(null)
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      setWidth(element.getBoundingClientRect().width)
    })
    // The observer reports the first size as soon as it starts observing.
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [element])
  const breakpoint = useMemo((): [GridBreakpoint, number] => {
    if (width === null || steps.length === 1 || !element) return widest
    const rem = parseFloat(getComputedStyle(element.ownerDocument.documentElement).fontSize) || 16
    // Compare like `min-width` does: a grid exactly 48em wide is at `md`.
    const thresholds = Object.fromEntries(
      steps.map(([key]) => [key, BREAKPOINT_EM[key] * rem - 0.5]),
    ) as Record<GridBreakpoint, number>
    const key = getBreakpointFromWidth(thresholds, width)
    return steps.find(([step]) => step === key) ?? widest
  }, [width, steps, widest, element])
  const cols = breakpoint[1]
  const editable = breakpoint[0] === widest[0]

  /* Items without an entry are added at the bottom, full width and two rows tall. */
  const [registered, setRegistered] = useState<readonly string[]>([])
  const register = useCallback((i: string) => {
    setRegistered((ids) => (ids.includes(i) ? ids : [...ids, i]))
    return () => {
      setRegistered((ids) => ids.filter((id) => id !== i))
    }
  }, [])
  const complete = useMemo(() => {
    let next: readonly GridItem[] = committed
    for (const i of registered) {
      if (!next.some((item) => item.i === i)) {
        next = appendItem(next, { i, w: widest[1], h: 2 }, { columns: widest[1], compaction })
      }
    }
    return next
  }, [committed, registered, widest, compaction])

  const display = useMemo((): readonly GridItem[] => {
    if (editable) return correctBounds(cloneLayout(complete), { cols })
    return findOrGenerateResponsiveLayout(
      { [widest[0]]: complete },
      Object.fromEntries(steps.map(([key]) => [key, BREAKPOINT_EM[key]])) as Record<
        GridBreakpoint,
        number
      >,
      breakpoint[0],
      widest[0],
      cols,
      compactType(compaction),
    )
  }, [editable, complete, cols, widest, steps, breakpoint, compaction])

  /*
   * Content sets a floor on each item's height: an item whose content needs more rows than
   * its entry gives it renders taller, and what's below moves down, so nothing overlaps.
   */
  const [fits, setFits] = useState<Readonly<Record<string, number>>>({})
  const fitted = useMemo(
    () => fitLayout(display, fits, { columns: cols, compaction }),
    [display, fits, cols, compaction],
  )

  /* The drag in progress: its preview, and where it asked to be. */
  const [preview, setPreview] = useState<readonly GridItem[] | null>(null)
  const [active, setActive] = useState<Active | null>(null)
  const [landed, setLanded] = useState<string | null>(null)
  useEffect(() => {
    if (landed === null) return
    const frame = requestAnimationFrame(() => {
      setLanded(null)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [landed])

  // The behaviours read the latest of all this through one ref, so they never go stale.
  const latest = useRef({ display, fitted, cols, compaction, onChange, layout })
  useIsomorphicLayoutEffect(() => {
    latest.current = { display, fitted, cols, compaction, onChange, layout }
  })
  const probe = useRef<HTMLDivElement | null>(null)

  // Measures every item at its content's own height (in the same frame, so it never paints)
  // whenever the grid, an item or an item's content changes size.
  useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return
    const nodes = () =>
      latest.current.display.flatMap((item) => {
        const node = controller.draggables.get(item.i)?.element
        return node && !node.hidden ? [[item.i, node] as const] : []
      })
    const resize = new ResizeObserver(() => {
      const unit = probe.current?.getBoundingClientRect()
      if (!unit?.height) return
      const items = nodes()
      for (const [, node] of items) node.setAttribute('data-measuring', '')
      const next = Object.fromEntries(
        items.map(([i, node]) => {
          const height = node.getBoundingClientRect().height
          return [i, Math.ceil((height + unit.width) / (unit.height + unit.width) - 0.01)]
        }),
      )
      for (const [, node] of items) node.removeAttribute('data-measuring')
      setFits((last) => {
        const keys = Object.keys(next)
        const same =
          keys.length === Object.keys(last).length && keys.every((i) => last[i] === next[i])
        return same ? last : next
      })
    })
    const observe = () => {
      resize.observe(element)
      for (const [, node] of nodes()) {
        for (const child of node.children) resize.observe(child)
      }
    }
    observe()
    const mutations = new MutationObserver(observe)
    mutations.observe(element, { childList: true, subtree: true })
    return () => {
      mutations.disconnect()
      resize.disconnect()
    }
  }, [element, controller])

  const behavior = useCallback(
    (i: string, mode: 'move' | 'resize', getLabel: () => string): CustomBehavior => {
      let start: GridItem | null = null
      let request: GridRequest | null = null
      let current: readonly GridItem[] | null = null
      let lastCell = ''
      let carried = { x: 0, y: 0 }
      const options = () => ({
        columns: latest.current.cols,
        compaction: latest.current.compaction,
      })
      const messages = () => controller.messages
      const find = (list: readonly GridItem[] | null) => list?.find((item) => item.i === i)
      const show = (next: readonly GridItem[]) => {
        current = next
        setPreview(next)
      }
      const element = () => controller.draggables.get(i)?.element ?? null
      const translate = (x: number, y: number) => {
        const node = element()
        node?.style.setProperty('--_dx', `${String(x)}px`)
        node?.style.setProperty('--_dy', `${String(y)}px`)
      }
      const describe = (fallback: GridItem) => placeOf(find(current) ?? fallback, getLabel())
      const reset = () => {
        carried = { x: 0, y: 0 }
        translate(0, 0)
        setPreview(null)
        setActive(null)
        current = null
        request = null
      }
      return {
        blocked: () => (editable ? null : messages().gridLocked(getLabel())),
        lift(input) {
          start = find(latest.current.display) ?? null
          const origin = find(latest.current.fitted)
          if (!start || !origin) return ''
          request = { x: start.x, y: start.y, w: start.w, h: start.h }
          lastCell = `${String(start.x)},${String(start.y)},${String(start.w)},${String(start.h)}`
          setActive({ i, mode, input, origin })
          show(latest.current.display)
          return messages().gridLifted(placeOf(start, getLabel()))
        },
        key(direction, shift) {
          if (!start || !request) return null
          const node = element()
          const rtl = node ? getComputedStyle(node).direction === 'rtl' : false
          const logical =
            rtl && (direction === 'left' || direction === 'right')
              ? direction === 'left'
                ? 'right'
                : 'left'
              : direction
          const base = latest.current.display
          if (shift) {
            const next = { ...request }
            if (logical === 'right') next.w += 1
            if (logical === 'left') next.w -= 1
            if (logical === 'down') next.h += 1
            if (logical === 'up') next.h -= 1
            const layout = previewLayout(base, i, next, options())
            const resized = find(layout)
            if (resized) {
              request = { ...next, w: resized.w, h: resized.h }
              show(layout)
            }
            return messages().gridResized(describe(start))
          }
          const step = stepInLayout(base, i, request, logical, options())
          if (step) {
            request = step.request
            show(step.layout)
          }
          return messages().gridMoved(describe(start))
        },
        pointer(move: EngineMove) {
          if (!start || !request) return null
          const node = element()
          const grid = node?.parentElement
          const gapAndRow = probe.current?.getBoundingClientRect()
          if (!grid || !gapAndRow) return null
          const rtl = getComputedStyle(grid).direction === 'rtl'
          const { cols: count } = latest.current
          const gapPx = gapAndRow.width
          const strideX = (grid.getBoundingClientRect().width - (count - 1) * gapPx) / count + gapPx
          const strideY = gapAndRow.height + gapPx
          if (mode === 'move') {
            // Carry the item with the pointer, but never past the grid's sides or top, so a
            // drag can't widen the page. Offsets leave out the translate already applied.
            carried = {
              x: Math.min(
                Math.max(move.delta.x, -node.offsetLeft),
                grid.clientWidth - node.offsetLeft - node.offsetWidth,
              ),
              y: Math.max(move.delta.y, -node.offsetTop),
            }
            translate(carried.x, carried.y)
          }
          const delta = mode === 'move' ? carried : move.delta
          const dx = (rtl ? -delta.x : delta.x) / strideX
          const dy = delta.y / strideY
          if (mode === 'move') {
            request = {
              ...request,
              x: start.x + Math.round(dx),
              y: Math.max(0, start.y + Math.round(dy)),
            }
          } else {
            request = {
              ...request,
              w: Math.max(1, start.w + Math.round(dx)),
              h: Math.max(1, start.h + Math.round(dy)),
            }
          }
          const cell = `${String(request.x)},${String(request.y)},${String(request.w)},${String(request.h)}`
          if (cell === lastCell) return null
          lastCell = cell
          const layout = previewLayout(latest.current.display, i, request, options())
          show(layout)
          const placed = find(layout)
          if (!placed) return null
          return mode === 'move'
            ? messages().gridMoved(placeOf(placed, getLabel()))
            : messages().gridResized(placeOf(placed, getLabel()))
        },
        drop() {
          const fallback = start
          const result = current
          const input = controller.operation?.input ?? 'keyboard'
          const placed = find(result) ?? fallback
          const changed =
            result !== null &&
            JSON.stringify(result.map(({ i: id, x, y, w, h }) => [id, x, y, w, h])) !==
              JSON.stringify(
                latest.current.display.map(({ i: id, x, y, w, h }) => [id, x, y, w, h]),
              )
          if (input === 'pointer') setLanded(i)
          reset()
          if (changed) {
            const next = [...result]
            if (latest.current.layout === undefined) setOwn(next)
            latest.current.onChange?.(next, { id: i, input })
          }
          return placed ? messages().gridDropped(placeOf(placed, getLabel())) : ''
        },
        cancel() {
          const original = start
          reset()
          return original ? messages().gridCanceled(placeOf(original, getLabel())) : ''
        },
      }
    },
    [controller, editable],
  )

  const rendered = useMemo(
    () => (preview ? fitLayout(preview, fits, { columns: cols, compaction }) : fitted),
    [preview, fits, cols, compaction, fitted],
  )
  const rows = bottom(rendered)
  const state = useMemo<GridState>(
    () => ({
      layout: rendered,
      active,
      landed,
      editable,
      register,
      behavior,
      messages: () => controller.messages,
    }),
    [rendered, active, landed, editable, register, behavior, controller],
  )

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node)
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )
  const placeholder =
    active?.input === 'pointer' && active.mode === 'move'
      ? rendered.find((item) => item.i === active.i)
      : undefined

  return (
    <GridContext.Provider value={state}>
      <div
        ref={ref}
        role="group"
        aria-label={label}
        {...rest}
        className={cx(styles.grid, className)}
        style={{
          ...({
            '--_cols': cols,
            '--_rows': rows,
            '--_gap': `var(--space-${String(gap)})`,
            '--_row': `var(--space-${String(rowHeight)})`,
          } as CSSProperties),
          ...style,
        }}
        data-dragging={active ? active.mode : undefined}
      >
        <div ref={probe} className={styles.probe} aria-hidden="true" />
        {placeholder ? (
          <div
            className={styles.placeholder}
            style={positionVars(placeholder)}
            aria-hidden="true"
          />
        ) : null}
        {children}
      </div>
    </GridContext.Provider>
  )
})

const positionVars = (item: GridItem): CSSProperties =>
  ({ '--_x': item.x, '--_y': item.y, '--_w': item.w, '--_h': item.h }) as CSSProperties

/* ─── GridLayout.Item ─────────────────────────────────────────────────────── */

const GridLayoutItem = forwardRef<HTMLDivElement, GridLayoutItemProps>(function GridLayoutItem(
  { id, label, resizable = true, className, style, children, ...rest },
  forwardedRef,
) {
  const grid = useContext(GridContext)
  if (!grid) throw new Error('GridLayout.Item must be rendered inside a GridLayout.')
  const controller = useDndController('GridLayout.Item')
  const { register, behavior, layout, active, landed, editable } = grid
  useIsomorphicLayoutEffect(() => register(id), [register, id])

  const item = layout.find((entry) => entry.i === id)
  // A pointer carries the item from where it was picked up; the placeholder shows its cell.
  const placed =
    active?.i === id && active.input === 'pointer' && active.mode === 'move' ? active.origin : item
  // The behaviours read the label from the item's record, which is written after each
  // commit, so it's always the latest.
  const getLabel = useCallback(
    () => controller.draggables.get(id)?.label ?? label,
    [controller, id, label],
  )
  const moveBehavior = useMemo(() => behavior(id, 'move', getLabel), [behavior, id, getLabel])
  const resizeBehavior = useMemo(() => behavior(id, 'resize', getLabel), [behavior, id, getLabel])
  const locked = !editable || item?.static === true

  const move = useDragSource(controller, {
    id,
    label,
    data: undefined,
    disabled: locked,
    kind: 'custom',
    custom: moveBehavior,
    feedback: 'none',
    instructions: 'grid',
    hasHandle: true,
  })

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      move.ref(node)
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [move, forwardedRef],
  )

  const mode = active?.i === id ? active.mode : undefined
  return (
    <HandleContext.Provider
      value={{ handleRef: move.handleRef, handleProps: move.handleProps, label, disabled: locked }}
    >
      <div
        ref={ref}
        {...rest}
        className={cx(styles.item, className)}
        style={{ ...(placed ? positionVars(placed) : {}), ...style }}
        hidden={item ? rest.hidden : true}
        data-dragging={active?.i === id ? active.input : undefined}
        data-mode={mode}
        data-landed={landed === id ? '' : undefined}
      >
        {children}
        {resizable && !locked ? (
          <ResizeGrip id={id} label={label} controller={controller} behavior={resizeBehavior} />
        ) : null}
      </div>
    </HandleContext.Provider>
  )
})

/** The corner grip a pointer resizes with. Keyboard users resize with Shift and the arrows. */
function ResizeGrip({
  id,
  label,
  controller,
  behavior,
}: {
  id: string
  label: string
  controller: DndController
  behavior: CustomBehavior
}) {
  const { ref } = useDragSource(controller, {
    id: `${id}\u0000resize`,
    label,
    data: undefined,
    disabled: false,
    kind: 'custom',
    custom: behavior,
    feedback: 'none',
    instructions: 'grid',
    hasHandle: false,
    keyboard: false,
  })
  return (
    <div ref={ref} className={styles.grip} aria-hidden="true" data-kiln-dnd-resize="">
      <svg viewBox="0 0 12 12" focusable="false">
        <path d="M11 4 4 11M11 8 8 11" />
      </svg>
    </div>
  )
}

/**
 * A dashboard grid: items you move and resize on a grid of columns and rows, by pointer,
 * touch or keyboard.
 *
 * @remarks
 * The layout is plain data, one `{ i, x, y, w, h }` per item in grid units, so you can
 * store it as JSON. Each `GridLayout.Item` matches an entry by `id` and is dragged by the
 * `DragHandle` you put inside it; a grip in its corner resizes it. While an item is
 * dragged, a placeholder shows where it will land and the other items make room; the
 * layout changes once, on drop, through `onChange`. A dragged item stays inside the grid:
 * it never runs past its sides or top, so a drag can't widen the page.
 *
 * An item is never shorter than its content. When the content needs more rows than the
 * layout gives it (text wraps as the grid narrows), the item renders taller and what's
 * below moves down, so items never overlap; the layout you store keeps its own heights.
 *
 * By keyboard, Space or Enter on a handle picks the item up. The arrow keys move it one
 * cell, Shift and the arrow keys resize it one cell, Space or Enter drops it and Escape
 * puts everything back. Each step is announced ("Revenue moved to row 2, column 7").
 *
 * Gaps close upward by default (`compaction`). Give `columns` per breakpoint and the grid
 * picks a column count from its own width; you store the layout for the widest, and
 * narrower ones are generated from it, read-only. Use `appendItem`, `removeItem` and
 * `compact` to change the layout in your own code. Movement animates, except under
 * reduced motion.
 */
export const GridLayout = Object.assign(
  forwardRef(GridLayoutRoot) as <T extends GridItem = GridItem>(
    props: GridLayoutProps<T> & { ref?: Ref<HTMLDivElement> },
  ) => ReactElement,
  { Item: GridLayoutItem },
)
