/** Where an item sits in a list, for an announcement. `index` counts from 0. */
export interface ListPlace {
  /** The item's name, from its `label`. */
  item: string
  /** Its index in the list, from 0. */
  index: number
  /** How many items the list holds with it in place. */
  count: number
  /** The list's name, when there is more than one list (a `Board` column). */
  list?: string
}

/** Where an item sits in a grid, for an announcement. Rows and columns count from 0. */
export interface GridPlace {
  /** The item's name, from its `label`. */
  item: string
  /** Its column, from 0. */
  x: number
  /** Its row, from 0. */
  y: number
  /** Its width, in columns. */
  w: number
  /** Its height, in rows. */
  h: number
}

/** A dragged item and the drop zone it's over, if any, for an announcement. */
export interface ZonePlace {
  /** The item's name, from its `label`. */
  item: string
  /** The drop zone's name, or `null` when it isn't over one. */
  zone: string | null
}

/**
 * Everything kiln-dnd says to screen reader users: the instructions every drag handle
 * points to, and what the announcer says at each step of a drag. Pass any subset as
 * `announcements` to translate or reword it; the rest stay English.
 */
export interface DndAnnouncements {
  /** How to use a list, board or drop-zone handle. Linked to every handle with `aria-describedby`. */
  instructions: string
  /** How to use a `GridLayout` handle, resize included. */
  gridInstructions: string
  /** The accessible name of a `DragHandle`. */
  handle: (item: string) => string
  /** An item in a list was picked up. */
  listLifted: (place: ListPlace) => string
  /** A picked-up list item moved. */
  listMoved: (place: ListPlace) => string
  /** A list item was dropped. */
  listDropped: (place: ListPlace) => string
  /** A list drag was cancelled; `place` is where the item is back at. */
  listCanceled: (place: ListPlace) => string
  /** An item that drops onto zones was picked up. */
  zoneLifted: (place: ZonePlace) => string
  /** A picked-up item moved over a drop zone, or off every zone. */
  zoneMoved: (place: ZonePlace) => string
  /** An item was dropped, onto a zone or onto nothing. */
  zoneDropped: (place: ZonePlace) => string
  /** A drag onto zones was cancelled. */
  zoneCanceled: (place: ZonePlace) => string
  /** A grid item was picked up. */
  gridLifted: (place: GridPlace) => string
  /** A picked-up grid item moved. */
  gridMoved: (place: GridPlace) => string
  /** A picked-up grid item was resized. */
  gridResized: (place: GridPlace) => string
  /** A grid item was dropped. */
  gridDropped: (place: GridPlace) => string
  /** A grid drag was cancelled; `place` is where the item is back at. */
  gridCanceled: (place: GridPlace) => string
  /**
   * A grid handle was pressed while the grid is narrower than its saved layout, where
   * items can't be rearranged.
   */
  gridLocked: (item: string) => string
}

const listPosition = ({ index, count, list }: ListPlace) =>
  `position ${String(index + 1)} of ${String(count)}${list ? ` in ${list}` : ''}`

const plural = (n: number, one: string, many: string) => `${String(n)} ${n === 1 ? one : many}`

const cell = ({ x, y }: GridPlace) => `row ${String(y + 1)}, column ${String(x + 1)}`
const size = ({ w, h }: GridPlace) =>
  `${plural(w, 'column', 'columns')} wide and ${plural(h, 'row', 'rows')} tall`

/** The English defaults. */
export const defaultAnnouncements: DndAnnouncements = {
  instructions:
    'To pick up, press Space or Enter. Then use the arrow keys to move, Space or Enter to drop, and Escape to cancel.',
  gridInstructions:
    'To pick up, press Space or Enter. Then use the arrow keys to move, Shift and the arrow keys to resize, Space or Enter to drop, and Escape to cancel.',
  handle: (item) => `Move ${item}`,
  listLifted: (p) => `Picked up ${p.item}, ${listPosition(p)}.`,
  listMoved: (p) => `${p.item} moved to ${listPosition(p)}.`,
  listDropped: (p) => `Dropped ${p.item} at ${listPosition(p)}.`,
  listCanceled: (p) => `Move cancelled. ${p.item} is back at ${listPosition(p)}.`,
  zoneLifted: (p) => `Picked up ${p.item}.`,
  zoneMoved: (p) =>
    p.zone ? `${p.item} is over ${p.zone}.` : `${p.item} is not over a drop zone.`,
  zoneDropped: (p) =>
    p.zone
      ? `Dropped ${p.item} on ${p.zone}.`
      : `${p.item} was not over a drop zone, so nothing moved.`,
  zoneCanceled: (p) => `Move cancelled. ${p.item} is back where it started.`,
  gridLifted: (p) => `Picked up ${p.item}, ${cell(p)}, ${size(p)}.`,
  gridMoved: (p) => `${p.item} moved to ${cell(p)}.`,
  gridResized: (p) => `${p.item} is now ${size(p)}.`,
  gridDropped: (p) => `Dropped ${p.item} at ${cell(p)}, ${size(p)}.`,
  gridCanceled: (p) => `Move cancelled. ${p.item} is back at ${cell(p)}, ${size(p)}.`,
  gridLocked: (item) => `${item} can be moved when the grid is wider.`,
}

/** The defaults with a consumer's overrides on top. */
export const resolveAnnouncements = (overrides?: Partial<DndAnnouncements>): DndAnnouncements =>
  overrides ? { ...defaultAnnouncements, ...overrides } : defaultAnnouncements
