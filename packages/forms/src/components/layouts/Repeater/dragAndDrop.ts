import type { ComponentType, ReactNode } from 'react'
import type { FormMessages } from '#runtime/messages'

/**
 * What `FormDragAndDrop.Item` puts on the element it renders: the drag library's class name and
 * the `data-` attributes it styles (the drop line, the lifted look), spread as they are.
 */
export interface RepeaterDragAttributes {
  className: string
}

/**
 * What a kit's `dragAndDrop` holds: the parts a `Repeater` with `reorderable="drag"` renders.
 *
 * @remarks
 * Pass `dragAndDrop` from `@mitcsutt/kiln-forms/dnd`, which builds these parts on
 * `@mitcsutt/kiln-dnd`. The shape is how the two entries talk to each other, so build it only
 * with that entry: it can change in any minor release.
 */
export interface FormDragAndDrop {
  /** One repeater's drag scope: the announcer, the handle instructions and the list's drop area. */
  readonly List: ComponentType<{
    /** The list's name. */
    label: string
    messages: FormMessages['drag']
    /** Called once per drop that moves an item. */
    onMove: (from: number, to: number, input: 'keyboard' | 'pointer') => void
    children: ReactNode
  }>
  /** One item. `children` renders its element, with `ref` and `props` on it. */
  readonly Item: ComponentType<{
    id: string
    index: number
    label: string
    children: (item: {
      ref: (element: HTMLElement | null) => void
      props: RepeaterDragAttributes
    }) => ReactNode
  }>
  /** The handle an item is dragged by, rendered inside its `Item`. */
  readonly Handle: ComponentType<{ 'data-repeater-action': 'drag' }>
}
