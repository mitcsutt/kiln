/**
 * Per-component render counts, read from React's commit hook (the one React DevTools uses).
 *
 * A `<Profiler>` fires when anything in its subtree commits, so it can't tell a layout's own
 * render from its fields' renders. This walks each committed fiber tree instead and records
 * every component that did work in that commit, by name and props. It must be installed before
 * `react-dom` loads, so `src/test/setup.ts` imports it first.
 *
 * It counts renders React committed: a render that bailed out (same props, a selector that
 * returned the same value) isn't counted. Works on React 18 and 19 in development builds.
 */

interface Fiber {
  tag: number
  type: unknown
  flags: number
  child: Fiber | null
  sibling: Fiber | null
  alternate: Fiber | null
  memoizedProps: unknown
}

interface FiberRoot {
  current: Fiber
}

/** A component render recorded during tracking. */
export interface RenderRecord {
  component: string
  props: Record<string, unknown>
}

// React's work tags for components: function, class, forwardRef, simple memo. `memo` with a
// custom compare (14) is skipped: its inner component has its own fiber and is counted there.
const FUNCTION = 0
const CLASS = 1
const FORWARD_REF = 11
const SIMPLE_MEMO = 15
const PERFORMED_WORK = 1

let records: RenderRecord[] | null = null

function nameOf(fiber: Fiber): string | null {
  const type = fiber.type as {
    displayName?: string
    name?: string
    render?: { displayName?: string; name?: string }
  } | null
  if (!type) return null
  switch (fiber.tag) {
    case FUNCTION:
    case CLASS:
    case SIMPLE_MEMO:
      return type.displayName ?? type.name ?? null
    case FORWARD_REF:
      return type.displayName ?? type.render?.displayName ?? type.render?.name ?? null
    default:
      return null
  }
}

function record(fiber: Fiber): void {
  const component = nameOf(fiber)
  if (component === null || records === null) return
  const props =
    typeof fiber.memoizedProps === 'object' && fiber.memoizedProps !== null
      ? (fiber.memoizedProps as Record<string, unknown>)
      : {}
  records.push({ component, props })
}

function mounted(fiber: Fiber): void {
  record(fiber)
  for (let child = fiber.child; child; child = child.sibling) mounted(child)
}

function updated(next: Fiber, prev: Fiber): void {
  if ((next.flags & PERFORMED_WORK) === PERFORMED_WORK) record(next)
  // The same child pointer means React reused the whole subtree: nothing below rendered.
  if (next.child === prev.child) return
  for (let child = next.child; child; child = child.sibling) {
    if (child.alternate) updated(child, child.alternate)
    else mounted(child)
  }
}

function onCommitFiberRoot(_rendererId: number, root: FiberRoot): void {
  if (records === null) return
  const next = root.current
  if (next.alternate) updated(next, next.alternate)
  else mounted(next)
}

const target = globalThis as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown }
if (target.__REACT_DEVTOOLS_GLOBAL_HOOK__ === undefined) {
  let nextId = 0
  target.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    renderers: new Map(),
    inject: () => (nextId += 1),
    onCommitFiberRoot,
    onCommitFiberUnmount: () => undefined,
    onPostCommitFiberRoot: () => undefined,
  }
}

export interface CommitLog {
  /** Renders of the component named `component`, optionally only instances whose props match. */
  count(component: string, match?: (props: Record<string, unknown>) => boolean): number
  /** Component name → renders, for every component that rendered (optionally filtered by name). */
  summary(include?: (component: string) => boolean): Record<string, number>
  /** Forgets everything recorded so far. */
  reset(): void
}

/** Starts recording renders (until the test ends: `setup.ts` stops it after each test). */
export function recordCommits(): CommitLog {
  const own: RenderRecord[] = []
  records = own
  return {
    count(component, match) {
      return own.filter((entry) => entry.component === component && (match?.(entry.props) ?? true))
        .length
    },
    summary(include) {
      const out: Record<string, number> = {}
      for (const { component } of own) {
        if (include && !include(component)) continue
        out[component] = (out[component] ?? 0) + 1
      }
      return out
    },
    reset() {
      own.length = 0
    },
  }
}

/** Stops recording. */
export function stopRecordingCommits(): void {
  records = null
}
