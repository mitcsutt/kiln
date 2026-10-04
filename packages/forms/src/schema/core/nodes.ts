import type {
  UntypedCondition,
  UntypedContentNode,
  UntypedCustomNode,
  UntypedFieldNode,
  UntypedLayoutNode,
  UntypedNode,
  UntypedRepeaterNode,
} from '#schema/core/types'
import { unsafePropReason } from '#schema/core/unsafeProps'

// `kind` wins: a field node may carry a `layout` prop ('stack' | 'horizontal' | 'inline').
export function isFieldNode(node: UntypedNode): node is UntypedFieldNode {
  return 'kind' in node
}
export function isRepeaterNode(node: UntypedNode): node is UntypedRepeaterNode {
  return !isFieldNode(node) && 'layout' in node && node.layout === 'repeater'
}
export function isLayoutNode(node: UntypedNode): node is UntypedLayoutNode {
  return !isFieldNode(node) && 'layout' in node && node.layout !== 'repeater'
}
export function isContentNode(node: UntypedNode): node is UntypedContentNode {
  return !isFieldNode(node) && 'content' in node
}
export function isCustomNode(node: UntypedNode): node is UntypedCustomNode {
  return !isFieldNode(node) && 'custom' in node
}

/** The nodes directly under a node (layout `children`, repeater `item`). */
export function childNodes(node: UntypedNode): readonly UntypedNode[] {
  if (isRepeaterNode(node)) return node.item
  if (isLayoutNode(node)) return node.children
  return []
}

/** Schema-only keys of a field node — everything else is passed to the field component. */
export const FIELD_SCHEMA_KEYS = [
  'kind',
  'name',
  'id',
  'when',
  'rules',
  'warnRules',
  'defaultValue',
  'whenHidden',
  'disabledWhen',
  'readOnlyWhen',
  'excludeWhen',
  'requiredWhen',
  'optionsFrom',
  'resets',
  'compute',
] as const

/** Schema-only keys of layout and repeater nodes. */
export const LAYOUT_SCHEMA_KEYS = [
  'layout',
  'id',
  'when',
  'children',
  'item',
  'newItem',
  'rules',
  'whenHidden',
] as const

/** Schema-only keys of content nodes. */
export const CONTENT_SCHEMA_KEYS = ['content', 'id', 'when'] as const

/** The node's own props: schema keys removed, and unsafe props (`unsafeProps.ts`) stripped. */
function omitKeys(node: object, keys: readonly string[], onField = false): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    if (!keys.includes(key) && unsafePropReason(key, value, onField) === undefined) out[key] = value
  }
  return out
}

/** The component props of a field node (`label`, `options`, `min`, …), schema keys removed. */
export function fieldNodeProps(node: UntypedFieldNode): Record<string, unknown> {
  return omitKeys(node, FIELD_SCHEMA_KEYS, true)
}

/** The component props of a layout or repeater node (`title`, `columns`, `label`, …). Repeater keeps `name`. */
export function layoutNodeProps(
  node: UntypedLayoutNode | UntypedRepeaterNode,
): Record<string, unknown> {
  return omitKeys(node, LAYOUT_SCHEMA_KEYS)
}

/** The props of a content node (`text`, `level`, `tone`, `label`, …). */
export function contentNodeProps(node: UntypedContentNode): Record<string, unknown> {
  return omitKeys(node, CONTENT_SCHEMA_KEYS)
}

/** Every condition a node carries, keyed by where it sits. */
export function nodeConditions(
  node: UntypedNode,
): Partial<
  Record<
    'when' | 'disabledWhen' | 'readOnlyWhen' | 'excludeWhen' | 'requiredWhen',
    UntypedCondition
  >
> {
  const out: Partial<
    Record<
      'when' | 'disabledWhen' | 'readOnlyWhen' | 'excludeWhen' | 'requiredWhen',
      UntypedCondition
    >
  > = {}
  if (node.when) out.when = node.when
  if (isFieldNode(node)) {
    if (node.disabledWhen) out.disabledWhen = node.disabledWhen
    if (node.readOnlyWhen) out.readOnlyWhen = node.readOnlyWhen
    if (node.excludeWhen) out.excludeWhen = node.excludeWhen
    if (node.requiredWhen) out.requiredWhen = node.requiredWhen
  }
  return out
}
