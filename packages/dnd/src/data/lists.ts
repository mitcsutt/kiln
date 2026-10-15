/**
 * Moves one entry of a list to a new index and returns a new array. The input is left
 * alone. An index out of range is clamped, so `arrayMove(items, 0, Infinity)` moves the
 * first entry to the end.
 *
 * @example
 * ```ts
 * arrayMove(['Draft', 'Review', 'Publish'], 2, 0) // ['Publish', 'Draft', 'Review']
 * ```
 */
export function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items]
  if (from < 0 || from >= next.length) return next
  const [moved] = next.splice(from, 1) as [T]
  next.splice(Math.max(0, Math.min(to, next.length)), 0, moved)
  return next
}

/** A position in a {@link moveBetween} map: the column's key and an index inside it. */
export interface ListPosition {
  /** The key of the column. */
  column: string
  /** The index inside that column. */
  index: number
}

/**
 * Moves one entry from one list of a map to another (or within one list) and returns a
 * new map. Lists that don't change keep their identity. This is the shape `Board` reads
 * and writes: `{ todo: […], doing: […], done: […] }`.
 *
 * @example
 * ```ts
 * moveBetween(cards, { column: 'todo', index: 0 }, { column: 'doing', index: 2 })
 * ```
 */
export function moveBetween<T>(
  lists: Readonly<Record<string, readonly T[]>>,
  from: ListPosition,
  to: ListPosition,
): Record<string, T[]> {
  const next: Record<string, T[]> = {}
  for (const [key, list] of Object.entries(lists)) next[key] = list as T[]
  const source = lists[from.column]
  if (!source || from.index < 0 || from.index >= source.length) return next
  if (from.column === to.column) {
    next[from.column] = arrayMove(source, from.index, to.index)
    return next
  }
  const remaining = [...source]
  const [moved] = remaining.splice(from.index, 1) as [T]
  const target = [...(lists[to.column] ?? [])]
  target.splice(Math.max(0, Math.min(to.index, target.length)), 0, moved)
  next[from.column] = remaining
  next[to.column] = target
  return next
}
