import { evaluateCondition } from '#schema/core/conditions'
import { isLayoutNode } from '#schema/core/nodes'
import type { UntypedFieldNode, UntypedNode } from '#schema/core/types'

export const DISABLED = 1
export const READ_ONLY = 2
export const EXCLUDED = 4
export const REQUIRED = 8

/**
 * A field node's state as one bit set: static `disabled` / `readOnly` /
 * `excluded` / `required` props, their `*When` conditions, and `compute` (always read-only). The
 * renderer subscribes to it with one primitive selector (§12.3) and `toStandardSchema` reads the
 * same function, so client and server agree on which fields are active. `inherited` = the
 * `layoutFlags` of the field's ancestors.
 */
export function fieldFlags(
  node: UntypedFieldNode,
  values: unknown,
  context: Record<string, unknown>,
  inherited = 0,
): number {
  const props = node as {
    disabled?: unknown
    readOnly?: unknown
    excluded?: unknown
    required?: unknown
  }
  let flags = inherited
  if (
    props.disabled === true ||
    (node.disabledWhen && evaluateCondition(node.disabledWhen, values, context))
  )
    flags |= DISABLED
  if (
    props.readOnly === true ||
    node.compute ||
    (node.readOnlyWhen && evaluateCondition(node.readOnlyWhen, values, context))
  ) {
    flags |= READ_ONLY
  }
  if (
    props.excluded === true ||
    (node.excludeWhen && evaluateCondition(node.excludeWhen, values, context))
  )
    flags |= EXCLUDED
  if (
    props.required === true ||
    (node.requiredWhen && evaluateCondition(node.requiredWhen, values, context))
  )
    flags |= REQUIRED
  return flags
}

/**
 * Default layouts whose `disabled` / `readOnly` props cascade to the fields inside
 * through `FieldPresentation` (`FormSection`, §9.2). Other layouts don't pass them to fields.
 */
const CASCADING_LAYOUTS: ReadonlySet<string> = new Set(['section'])

/**
 * The flags a layout node passes down to every field under it: a `section` with
 * `readOnly: true` makes its fields read-only on the client, so the server must skip them too.
 */
export function layoutFlags(node: UntypedNode): number {
  if (!isLayoutNode(node) || !CASCADING_LAYOUTS.has(node.layout)) return 0
  // Only what `FormSection` passes to `FieldPresentation`: it has no `excluded` prop, so a
  // section's `excluded` doesn't reach its fields on the client and mustn't on the server.
  const props = node as { disabled?: unknown; readOnly?: unknown }
  let flags = 0
  if (props.disabled === true) flags |= DISABLED
  if (props.readOnly === true) flags |= READ_ONLY
  return flags
}

/** Whether a field node has any condition-driven flag (else its flags never change). */
export function hasConditionFlags(node: UntypedFieldNode): boolean {
  return Boolean(node.disabledWhen ?? node.readOnlyWhen ?? node.excludeWhen ?? node.requiredWhen)
}
