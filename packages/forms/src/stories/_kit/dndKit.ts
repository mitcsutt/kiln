import { dragAndDrop } from '#dnd'
import { kit } from '#kit/defaultKit'

/** The default kit with drag and drop, for stories of `Repeater reorderable="drag"`. */
export const dndKit = kit.extend({ dragAndDrop })
