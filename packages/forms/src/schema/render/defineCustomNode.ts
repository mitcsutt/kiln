import type { CustomNodeComponent, CustomNodeProps } from '#kit/types'
import type { JsonObject } from '#schema/core/types'

/**
 * A schema custom node (§10.5): `{ custom: key, props }` renders this component with
 * `{ form, props, node }`. Register it with `kit.extend({ nodes: { key: … } })`; the node's JSON
 * `props` are then typed from `P`. Identity at runtime.
 */
export function defineCustomNode<P extends JsonObject = JsonObject>(
  component: (props: CustomNodeProps<P>) => ReturnType<CustomNodeComponent<P>>,
): CustomNodeComponent<P> {
  return component
}
