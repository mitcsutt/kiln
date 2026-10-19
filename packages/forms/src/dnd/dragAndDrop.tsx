import {
  Dnd,
  DragHandle,
  SortableItem,
  useDroppable,
  type DndAnnouncements,
  type DragEndEvent,
  type ListPlace,
} from '@mitcsutt/kiln-dnd'
import { useCallback, useId, useMemo, type ComponentProps, type ReactNode } from 'react'
import type { FormDragAndDrop } from '#components/layouts/Repeater/dragAndDrop'
import type { FormMessages } from '#runtime/messages'

type ListProps = ComponentProps<FormDragAndDrop['List']>
type ItemProps = ComponentProps<FormDragAndDrop['Item']>
type ElementRef = (element: HTMLElement | null) => void

/** Each repeater has a `Dnd` scope of its own, so one list name serves them all. */
const LIST = 'repeater'

/** `FormMessages.drag`'s defaults, here so that only forms with drag and drop carry them. */
const defaultDragMessages: Required<FormMessages['drag']> = {
  instructions:
    'To pick up, press Space or Enter. Then use the arrow keys to move, Space or Enter to drop, and Escape to cancel.',
  handle: (item) => `Drag ${item}`,
  lifted: (item, position, count) =>
    `Picked up ${item}, position ${String(position)} of ${String(count)}.`,
  moved: (item, position, count) =>
    `${item} moved to position ${String(position)} of ${String(count)}.`,
  dropped: (item, position, count) =>
    `Dropped ${item} at position ${String(position)} of ${String(count)}.`,
  canceled: (item, position, count) =>
    `Move cancelled. ${item} is back at position ${String(position)} of ${String(count)}.`,
}

/** The repeater's words as kiln-dnd's announcements, rebuilt only when one of them changes. */
function useAnnouncements(messages: FormMessages['drag']): Partial<DndAnnouncements> {
  const { instructions, handle, lifted, moved, dropped, canceled } = {
    ...defaultDragMessages,
    ...messages,
  }
  return useMemo(() => {
    const at =
      (say: (item: string, position: number, count: number) => string) =>
      ({ item, index, count }: ListPlace) =>
        say(item, index + 1, count)
    return {
      instructions,
      handle,
      listLifted: at(lifted),
      listMoved: at(moved),
      listDropped: at(dropped),
      listCanceled: at(canceled),
    }
  }, [instructions, handle, lifted, moved, dropped, canceled])
}

function RepeaterDragList({ label, messages, onMove, children }: ListProps) {
  const announcements = useAnnouncements(messages)
  const onDragEnd = useCallback(
    ({ item, target, input }: DragEndEvent) => {
      if (target?.kind === 'list' && item.index !== undefined)
        onMove(item.index, target.index, input)
    },
    [onMove],
  )
  return (
    <Dnd announcements={announcements} onDragEnd={onDragEnd}>
      <RepeaterDropArea label={label}>{children}</RepeaterDropArea>
    </Dnd>
  )
}

/** The list's container: a pointer between or past the items still lands in the list. */
function RepeaterDropArea({ label, children }: { label: string; children: ReactNode }) {
  const { ref } = useDroppable({ id: useId(), label, list: LIST })
  return <div ref={ref}>{children}</div>
}

function RepeaterDragItem({ id, index, label, setItemElement, children }: ItemProps) {
  return (
    <SortableItem id={id} index={index} label={label} list={LIST} handle>
      {({ ref, props }) => (
        <ItemRef source={ref} index={index} setItemElement={setItemElement}>
          {(merged) => children({ ref: merged, props })}
        </ItemRef>
      )}
    </SortableItem>
  )
}

/**
 * One ref for the item's element that tells both kiln-dnd and the repeater's item-focus map.
 * Its inputs are stable, so the element is never detached and attached again on a render.
 */
function ItemRef({
  source,
  index,
  setItemElement,
  children,
}: {
  source: ElementRef
  index: number
  setItemElement: ItemProps['setItemElement']
  children: (ref: ElementRef) => ReactNode
}) {
  const ref = useCallback(
    (element: HTMLElement | null) => {
      source(element)
      setItemElement(index)(element)
    },
    [source, index, setItemElement],
  )
  return <>{children(ref)}</>
}

function RepeaterDragHandle(props: { 'data-repeater-action': 'drag' }) {
  return <DragHandle {...props} />
}

/**
 * Drag and drop for `Repeater reorderable="drag"`, built on `@mitcsutt/kiln-dnd`.
 *
 * @remarks
 * Give it to the kit once, and every repeater with `reorderable="drag"` gets a drag handle on
 * each item, in component and schema mode alike:
 *
 * ```ts
 * import { kit } from '@mitcsutt/kiln-forms'
 * import { dragAndDrop } from '@mitcsutt/kiln-forms/dnd'
 *
 * export const formKit = kit.extend({ dragAndDrop })
 * ```
 *
 * It needs `@mitcsutt/kiln-dnd` installed (an optional peer dependency) and its stylesheet,
 * `@mitcsutt/kiln-dnd/styles.css`, imported after kiln-ui's. Forms that don't import this
 * entry never load kiln-dnd.
 */
export const dragAndDrop: FormDragAndDrop = {
  List: RepeaterDragList,
  Item: RepeaterDragItem,
  Handle: RepeaterDragHandle,
}
