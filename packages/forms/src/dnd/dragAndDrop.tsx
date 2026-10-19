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

/** Each repeater has a `Dnd` scope of its own, so one list name serves them all. */
const LIST = 'repeater'

/** The repeater's words as kiln-dnd's announcements, rebuilt only when one of them changes. */
function useAnnouncements(messages: FormMessages['drag']): Partial<DndAnnouncements> {
  const { instructions, handle, lifted, moved, dropped, canceled } = messages
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

function RepeaterDragItem({ id, index, label, children }: ItemProps) {
  return (
    <SortableItem id={id} index={index} label={label} list={LIST} handle>
      {({ ref, props }) => children({ ref, props })}
    </SortableItem>
  )
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
