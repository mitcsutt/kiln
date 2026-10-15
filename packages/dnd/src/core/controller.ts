/*
 * One drag-and-drop scope: what's registered in it, the drag in progress, and the one
 * keyboard model every pattern shares. `Dnd` creates one; the presets each render a `Dnd`.
 *
 * A drag is the same state machine whichever input drives it:
 *
 *   start (Space/Enter, or the engine's pointer dragstart)
 *     → move (an arrow key, or a pointer move) sets the target, in data space
 *     → drop (Space/Enter, or pointer up) or cancel (Escape, blur, or pointer cancel)
 *
 * Lists, boards and drop zones share the behaviours below. GridLayout brings its own
 * (`CustomBehavior`), because its target is a whole layout rather than one slot.
 */
import type { DndAnnouncements } from './messages'
import type { Engine, EngineMove } from './engineTypes'
import { createStore, type Store } from './store'

/** How a drag is being driven. */
export type DragInput = 'keyboard' | 'pointer'

/** A list's direction: the arrow keys along it move an item through the list. */
export type ListOrientation = 'vertical' | 'horizontal'

/** The dragged item, as the event callbacks see it. */
export interface DndItem {
  /** The item's id. */
  id: string
  /** The item's name, as announcements say it. */
  label: string
  /** Whatever you passed as `data` when you made it draggable. */
  data: unknown
  /** For a sortable item: the list it started in. */
  list?: string
  /** For a sortable item: its index there, from 0. */
  index?: number
}

/** Where a dragged item would land: a drop zone, or a position in a list. */
export type DndTarget =
  | {
      kind: 'zone'
      /** The drop zone's id. */
      id: string
      /** The drop zone's name. */
      label: string
      /** Whatever you passed as the zone's `data`. */
      data: unknown
    }
  | {
      kind: 'list'
      /** The list's id. */
      list: string
      /** The item's index in that list once dropped, from 0. */
      index: number
    }

/** Passed to `onDragStart`. */
export interface DragStartEvent {
  item: DndItem
  input: DragInput
}

/** Passed to `onDragOver` whenever the target changes. */
export interface DragOverEvent {
  item: DndItem
  target: DndTarget | null
  input: DragInput
}

/**
 * Passed to `onDragEnd` when an item is dropped. A sortable item only ends here when the
 * drop moves it (to another slot, list or zone); a draggable always does, with `target`
 * `null` if it was over no zone.
 */
export interface DragEndEvent {
  item: DndItem
  target: DndTarget | null
  input: DragInput
}

/**
 * Passed to `onDragCancel`: on Escape, focus leaving the handle or a cancelled pointer drag,
 * and when a sortable item is dropped where nothing moves (back in its own slot, or over
 * nothing).
 */
export interface DragCancelEvent {
  item: DndItem
  input: DragInput
}

export interface DndCallbacks {
  onDragStart?: (event: DragStartEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  onDragCancel?: (event: DragCancelEvent) => void
}

type Target =
  { kind: 'zone'; id: string } | { kind: 'list'; list: string; index: number } | { kind: 'custom' }

export interface Operation {
  id: string
  input: DragInput
  target: Target | null
}

export interface RootState {
  operation: Operation | null
  /** Bumped on every announcement so the same words can be said twice. */
  announcement: { text: string; key: number }
  /** A handle that should take focus once it renders (after a keyboard drop moves it). */
  focusId: string | null
  engine: Engine | null
  /** What the scope says, with the consumer's overrides. */
  messages: DndAnnouncements
}

export type ArrowDirection = 'up' | 'down' | 'left' | 'right'

/** The behaviour a pattern with its own idea of a target (GridLayout) plugs in. */
export interface CustomBehavior {
  /** Said when a disabled item's handle is pressed, if there's a reason worth giving. */
  blocked?: () => string | null
  lift: (input: DragInput) => string
  key: (direction: ArrowDirection, shift: boolean) => string | null
  pointer: (move: EngineMove) => string | null
  drop: () => string
  cancel: () => string
}

export interface DraggableRecord {
  id: string
  label: string
  data: unknown
  disabled: boolean
  /** `zone`: drops onto drop zones. `list`: sortable. `custom`: brings its own behaviour. */
  kind: 'zone' | 'list' | 'custom'
  list: string
  index: number
  custom: CustomBehavior | null
  element: HTMLElement | null
  handle: HTMLElement | null
}

export interface DroppableRecord {
  id: string
  label: string
  data: unknown
  disabled: boolean
  accept: ((item: DndItem) => boolean) | undefined
  /** Set when this droppable is a sortable list's container. */
  list: string | undefined
  orientation: ListOrientation
  element: HTMLElement | null
  onDrop: ((item: DndItem) => void) | undefined
}

interface ListGroup {
  id: string
  label: string
  orientation: ListOrientation
  items: DraggableRecord[]
}

const KEYS: Record<string, ArrowDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

/** Wait this long after the last pointer move before announcing where the item is. */
export const POINTER_ANNOUNCE_DELAY = 300

const documentOrder = (a: Element | null, b: Element | null): number => {
  if (!a || !b || a === b) return 0
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

export class DndController {
  readonly store: Store<RootState>
  readonly draggables = new Map<string, DraggableRecord>()
  readonly droppables = new Map<string, DroppableRecord>()
  callbacks: DndCallbacks = {}
  /** The ids of the scope's hidden instructions, which every handle points to. */
  readonly instructionIds: { list: string; grid: string }
  #announceTimer: ReturnType<typeof setTimeout> | undefined
  #liftedHandle: HTMLElement | null = null

  constructor(messages: DndAnnouncements, scopeId: string) {
    this.instructionIds = { list: `${scopeId}-instructions`, grid: `${scopeId}-grid-instructions` }
    this.store = createStore<RootState>({
      operation: null,
      announcement: { text: '', key: 0 },
      focusId: null,
      engine: null,
      messages,
    })
  }

  setCallbacks(callbacks: DndCallbacks): void {
    this.callbacks = callbacks
  }

  get messages(): DndAnnouncements {
    return this.store.get().messages
  }

  /* ─── Announcements ──────────────────────────────────────────────────────── */

  announce(text: string, debounce = false): void {
    clearTimeout(this.#announceTimer)
    const say = () => {
      const { announcement } = this.store.get()
      this.store.set({ announcement: { text, key: announcement.key + 1 } })
    }
    if (debounce) this.#announceTimer = setTimeout(say, POINTER_ANNOUNCE_DELAY)
    else say()
  }

  /* ─── Lookups ────────────────────────────────────────────────────────────── */

  item(record: DraggableRecord): DndItem {
    const item: DndItem = { id: record.id, label: record.label, data: record.data }
    if (record.kind === 'list') {
      item.list = record.list
      item.index = record.index
    }
    return item
  }

  /** The sortable lists in this scope, in document order. */
  lists(): ListGroup[] {
    const byId = new Map<string, ListGroup>()
    const ensure = (id: string): ListGroup => {
      let group = byId.get(id)
      if (!group) {
        group = { id, label: id, orientation: 'vertical', items: [] }
        byId.set(id, group)
      }
      return group
    }
    for (const droppable of this.droppables.values()) {
      if (droppable.list === undefined) continue
      const group = ensure(droppable.list)
      group.label = droppable.label
      group.orientation = droppable.orientation
    }
    for (const record of this.draggables.values()) {
      if (record.kind === 'list') ensure(record.list).items.push(record)
    }
    for (const group of byId.values()) group.items.sort((a, b) => a.index - b.index)
    const anchor = (group: ListGroup) =>
      this.containerOf(group.id)?.element ?? group.items[0]?.element ?? null
    return [...byId.values()].sort((a, b) => documentOrder(anchor(a), anchor(b)))
  }

  containerOf(list: string): DroppableRecord | undefined {
    for (const droppable of this.droppables.values()) if (droppable.list === list) return droppable
    return undefined
  }

  /** Drop zones the item can land on, in document order. */
  zonesFor(record: DraggableRecord): DroppableRecord[] {
    const item = this.item(record)
    return [...this.droppables.values()]
      .filter((zone) => zone.list === undefined && !zone.disabled)
      .filter((zone) => zone.accept?.(item) ?? true)
      .sort((a, b) => documentOrder(a.element, b.element))
  }

  accepts(droppableId: string, sourceId: string): boolean {
    const zone = this.droppables.get(droppableId)
    const source = this.draggables.get(sourceId)
    if (!zone || !source || zone.disabled) return false
    if (zone.list !== undefined) return source.kind === 'list'
    return zone.accept?.(this.item(source)) ?? true
  }

  /** The items of `list` other than the dragged one: the slots a drop chooses between. */
  others(list: ListGroup, sourceId: string): DraggableRecord[] {
    return list.items.filter((item) => item.id !== sourceId)
  }

  publicTarget(target: Target | null): DndTarget | null {
    if (!target || target.kind === 'custom') return null
    if (target.kind === 'list') return { kind: 'list', list: target.list, index: target.index }
    const zone = this.droppables.get(target.id)
    return zone ? { kind: 'zone', id: zone.id, label: zone.label, data: zone.data } : null
  }

  /* ─── What a list or zone drag says ──────────────────────────────────────── */

  #listPlace(record: DraggableRecord, target: Target | null) {
    const lists = this.lists()
    const at =
      target?.kind === 'list' ? target : { kind: 'list', list: record.list, index: record.index }
    const group = lists.find((list) => list.id === at.list)
    const count = group ? this.others(group, record.id).length + 1 : 1
    return {
      item: record.label,
      index: at.index,
      count,
      ...(lists.length > 1 && group ? { list: group.label } : {}),
    }
  }

  #zonePlace(record: DraggableRecord, target: Target | null) {
    const zone = target?.kind === 'zone' ? this.droppables.get(target.id) : undefined
    return { item: record.label, zone: zone?.label ?? null }
  }

  #describe(
    record: DraggableRecord,
    target: Target | null,
    step: 'Lifted' | 'Moved' | 'Dropped' | 'Canceled',
  ): string {
    const m = this.messages
    if (record.kind === 'list' && target?.kind !== 'zone') {
      return m[`list${step}`](this.#listPlace(record, target))
    }
    return m[`zone${step}`](this.#zonePlace(record, target))
  }

  /* ─── The drag ───────────────────────────────────────────────────────────── */

  get operation(): Operation | null {
    return this.store.get().operation
  }

  start(id: string, input: DragInput): void {
    const record = this.draggables.get(id)
    if (!record || record.disabled || this.operation) return
    const target: Target | null =
      record.kind === 'list'
        ? { kind: 'list', list: record.list, index: record.index }
        : record.kind === 'custom'
          ? { kind: 'custom' }
          : null
    this.store.set({ operation: { id, input, target }, focusId: null })
    this.announce(
      record.custom ? record.custom.lift(input) : this.#describe(record, target, 'Lifted'),
    )
    if (input === 'keyboard') this.#watchFocus(record)
    this.callbacks.onDragStart?.({ item: this.item(record), input })
  }

  /** Moves the drag's target. Announces it, debounced for a pointer. */
  retarget(target: Target | null): void {
    const operation = this.operation
    const record = operation && this.draggables.get(operation.id)
    if (!operation || !record) return
    const same =
      JSON.stringify(target) === JSON.stringify(operation.target) && operation.input === 'pointer'
    if (same) return
    this.store.set({ operation: { ...operation, target } })
    this.announce(this.#describe(record, target, 'Moved'), operation.input === 'pointer')
    this.callbacks.onDragOver?.({
      item: this.item(record),
      target: this.publicTarget(target),
      input: operation.input,
    })
  }

  drop(): void {
    const operation = this.operation
    const record = operation && this.draggables.get(operation.id)
    if (!operation || !record) return
    this.#endWatch()
    const { target, input } = operation
    if (record.custom) {
      const text = record.custom.drop()
      this.#finish(input, record.id)
      this.announce(text)
      return
    }
    const noMove =
      !target ||
      (target.kind === 'list' && target.list === record.list && target.index === record.index)
    if (record.kind === 'list' && noMove) {
      // Nothing changes, so say so the way a cancel does.
      this.#finish(input, record.id)
      this.announce(this.#describe(record, null, target ? 'Dropped' : 'Canceled'))
      this.callbacks.onDragCancel?.({ item: this.item(record), input })
      return
    }
    const item = this.item(record)
    const text = this.#describe(record, target, 'Dropped')
    this.#finish(input, record.id)
    this.announce(text)
    if (target?.kind === 'zone') this.droppables.get(target.id)?.onDrop?.(item)
    this.callbacks.onDragEnd?.({ item, target: this.publicTarget(target), input })
  }

  cancel(): void {
    const operation = this.operation
    const record = operation && this.draggables.get(operation.id)
    if (!operation || !record) return
    this.#endWatch()
    const text = record.custom
      ? record.custom.cancel()
      : this.#describe(record, record.kind === 'list' ? null : operation.target, 'Canceled')
    this.#finish(operation.input, record.id)
    this.announce(text)
    this.callbacks.onDragCancel?.({ item: this.item(record), input: operation.input })
  }

  #finish(input: DragInput, id: string): void {
    // After a keyboard drop the item may render somewhere new (another list, another
    // index), so its handle asks for focus back once it does.
    this.store.set({ operation: null, focusId: input === 'keyboard' ? id : null })
  }

  /* ─── Keyboard ───────────────────────────────────────────────────────────── */

  /** The keyboard model, shared by every handle. Returns true if it used the key. */
  keyDown(
    id: string,
    event: { key: string; shiftKey: boolean; repeat: boolean; preventDefault: () => void },
  ): boolean {
    const operation = this.operation
    const lifting = event.key === ' ' || event.key === 'Enter'
    if (!operation) {
      if (!lifting || event.repeat) return false
      const record = this.draggables.get(id)
      if (!record) return false
      if (record.disabled) {
        const reason = record.custom?.blocked?.()
        if (!reason) return false
        event.preventDefault()
        this.announce(reason)
        return true
      }
      event.preventDefault()
      this.start(id, 'keyboard')
      return true
    }
    if (operation.id !== id || operation.input !== 'keyboard') return false
    if (lifting) {
      event.preventDefault()
      if (!event.repeat) this.drop()
      return true
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      this.cancel()
      return true
    }
    const direction = KEYS[event.key]
    if (!direction) return false
    event.preventDefault()
    this.#arrow(id, direction, event.shiftKey)
    return true
  }

  #arrow(id: string, direction: ArrowDirection, shift: boolean): void {
    const record = this.draggables.get(id)
    const operation = this.operation
    if (!record || !operation) return
    if (record.custom) {
      const text = record.custom.key(direction, shift)
      if (text) this.announce(text)
      return
    }
    if (record.kind === 'list') {
      this.retarget(this.#listStep(record, operation.target, direction))
      return
    }
    this.retarget(this.#zoneStep(record, operation.target, direction))
  }

  /**
   * A list item's next target. The arrows across the last list carry on onto the drop zones
   * that accept it, in document order; from a zone, the arrows step through the zones, and
   * back past the first one to the last list.
   */
  #listStep(record: DraggableRecord, current: Target | null, direction: ArrowDirection): Target {
    const lists = this.lists()
    const forward = direction === 'down' || direction === 'right'
    if (current?.kind === 'zone') {
      const zones = this.zonesFor(record)
      const at = zones.findIndex((zone) => zone.id === current.id)
      const zone = zones[at + (forward ? 1 : -1)]
      if (zone) return { kind: 'zone', id: zone.id }
      const last = lists.at(-1)
      if (forward || !last) return current
      const index = Math.min(record.index, this.others(last, record.id).length)
      return { kind: 'list', list: last.id, index }
    }
    const at =
      current?.kind === 'list'
        ? current
        : { kind: 'list' as const, list: record.list, index: record.index }
    const position = lists.findIndex((list) => list.id === at.list)
    const group = lists[position]
    if (!group) return at
    const vertical = group.orientation === 'vertical'
    const along = vertical
      ? direction === 'up' || direction === 'down'
      : !(direction === 'up' || direction === 'down')
    if (along) {
      const last = this.others(group, record.id).length
      const index = Math.max(0, Math.min(last, at.index + (forward ? 1 : -1)))
      return { kind: 'list', list: group.id, index }
    }
    const next = lists[position + (forward ? 1 : -1)]
    if (!next) {
      const zone = forward ? this.zonesFor(record)[0] : undefined
      return zone ? { kind: 'zone', id: zone.id } : at
    }
    const last = this.others(next, record.id).length
    return { kind: 'list', list: next.id, index: Math.min(at.index, last) }
  }

  #zoneStep(
    record: DraggableRecord,
    current: Target | null,
    direction: ArrowDirection,
  ): Target | null {
    const zones = this.zonesFor(record)
    if (zones.length === 0) return null
    const at = current?.kind === 'zone' ? zones.findIndex((zone) => zone.id === current.id) : -1
    const forward = direction === 'down' || direction === 'right'
    const next =
      at === -1
        ? forward
          ? 0
          : zones.length - 1
        : (at + (forward ? 1 : -1) + zones.length) % zones.length
    const zone = zones[next]
    return zone ? { kind: 'zone', id: zone.id } : null
  }

  /** Leaving the handle while an item is lifted (Tab, a click elsewhere) cancels the drag. */
  #watchFocus(record: DraggableRecord): void {
    const handle = record.handle ?? record.element
    if (!handle) return
    this.#liftedHandle = handle
    handle.addEventListener('focusout', this.#onFocusOut)
  }

  #endWatch(): void {
    this.#liftedHandle?.removeEventListener('focusout', this.#onFocusOut)
    this.#liftedHandle = null
  }

  #onFocusOut = (event: FocusEvent): void => {
    const handle = this.#liftedHandle
    // Focus moving inside the handle (an icon in a button) isn't leaving it.
    if (handle && event.relatedTarget instanceof Node && handle.contains(event.relatedTarget))
      return
    if (this.operation?.input === 'keyboard') this.cancel()
  }

  /* ─── Pointer (from the engine) ──────────────────────────────────────────── */

  readonly pointer = {
    start: (sourceId: string): void => {
      this.start(sourceId, 'pointer')
    },
    move: (move: EngineMove): void => {
      const operation = this.operation
      const record = operation && this.draggables.get(operation.id)
      if (!operation || !record || operation.input !== 'pointer') return
      if (record.custom) {
        const text = record.custom.pointer(move)
        if (text) this.announce(text, true)
        return
      }
      this.retarget(
        record.kind === 'list'
          ? this.#listTargetAt(record, move)
          : this.#zoneTargetAt(record, move),
      )
    },
    end: (move: EngineMove, canceled: boolean): void => {
      if (this.operation?.input !== 'pointer') return
      if (!canceled) this.pointer.move(move)
      if (canceled) this.cancel()
      else this.drop()
    },
  }

  #zoneTargetAt(record: DraggableRecord, move: EngineMove): Target | null {
    const id = move.targetId
    if (id === null || !this.accepts(id, record.id)) return null
    const zone = this.droppables.get(id)
    return zone && zone.list === undefined ? { kind: 'zone', id } : null
  }

  /**
   * The slot a pointer points at: the list under it, and the number of that list's other
   * items whose middle comes before the pointer. Counting middles rather than trusting the
   * one item under the pointer keeps the drop line steady over the gaps between items.
   */
  #listTargetAt(record: DraggableRecord, move: EngineMove): Target | null {
    const id = move.targetId
    if (id === null) return null
    const zone = this.droppables.get(id)
    if (zone && zone.list === undefined) return this.#zoneTargetAt(record, move)
    const listId = zone?.list ?? this.draggables.get(id)?.list
    const group = this.lists().find((list) => list.id === listId)
    if (!group) return null
    const vertical = group.orientation === 'vertical'
    const point = vertical ? move.pointer.y : move.pointer.x
    let index = 0
    for (const other of this.others(group, record.id)) {
      const rect = other.element?.getBoundingClientRect()
      if (!rect) continue
      const middle = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2
      if (middle < point) index++
    }
    return { kind: 'list', list: group.id, index }
  }

  /* ─── What an item or zone draws ─────────────────────────────────────────── */

  /** Where the drop line goes, relative to item `id`, for the drag in progress. */
  dropEdge(state: RootState, id: string): 'before' | 'after' | null {
    const operation = state.operation
    const target = operation?.target
    if (!operation || target?.kind !== 'list' || operation.id === id) return null
    const source = this.draggables.get(operation.id)
    const record = this.draggables.get(id)
    if (!source || record?.kind !== 'list' || record.list !== target.list) return null
    if (source.list === target.list && source.index === target.index) return null
    const group = this.lists().find((list) => list.id === target.list)
    if (!group) return null
    const others = this.others(group, source.id)
    if (others[target.index]?.id === id) return 'before'
    if (target.index === others.length && others.at(-1)?.id === id) return 'after'
    return null
  }

  /** Whether droppable `id` is what the drag is over (an empty list counts when it's the target). */
  isOver(state: RootState, id: string): boolean {
    const target = state.operation?.target
    if (!target || !state.operation) return false
    if (target.kind === 'zone') return target.id === id
    if (target.kind !== 'list') return false
    const droppable = this.droppables.get(id)
    if (droppable?.list !== target.list) return false
    const group = this.lists().find((list) => list.id === target.list)
    return group ? this.others(group, state.operation.id).length === 0 : false
  }

  destroy(): void {
    clearTimeout(this.#announceTimer)
    this.#endWatch()
    this.store.get().engine?.destroy()
  }
}
