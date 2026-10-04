import type { Computer } from '#core/kit/types'
import type { RuntimeDeriveRule } from '#core/runtime/formRuntime'
import { childNodes, isFieldNode, isRepeaterNode } from '#schema/core/nodes'
import type { UntypedFormSchema, UntypedNode } from '#schema/core/types'
import { warnOnce } from '#schema/render/warn'

const cache = new WeakMap<UntypedFormSchema, WeakMap<object, readonly RuntimeDeriveRule[]>>()

/**
 * A schema's `compute` fields as runtime derive rules (§10.6 "compute → form derive registration"),
 * computed once per (schema, computer registry). Only root-scope fields: an item field's path is
 * per item, which a static rule can't name (dev warning).
 */
export function schemaDeriveRules(
  schema: UntypedFormSchema,
  computers: Readonly<Record<string, Computer>>,
): readonly RuntimeDeriveRule[] {
  let byRegistry = cache.get(schema)
  if (!byRegistry) {
    byRegistry = new WeakMap()
    cache.set(schema, byRegistry)
  }
  const cached = byRegistry.get(computers)
  if (cached) return cached
  const rules: RuntimeDeriveRule[] = []
  const walk = (node: UntypedNode, inItem: boolean): void => {
    if (isFieldNode(node) && node.compute) {
      const { computer: key, from } = node.compute
      const computer = Object.prototype.hasOwnProperty.call(computers, key)
        ? computers[key]
        : undefined
      if (!computer)
        warnOnce(
          `Unknown computer "${key}" (field "${node.name}"). Register it with kit.extend({ computers }).`,
        )
      else if (inItem)
        warnOnce(
          `\`compute\` on a repeater item field ("${node.name}") is not supported; it is ignored.`,
        )
      else rules.push({ field: node.name, from, compute: (values) => computer.compute(values) })
    }
    for (const child of childNodes(node)) walk(child, inItem || isRepeaterNode(node))
  }
  walk(schema.root, false)
  byRegistry.set(computers, rules)
  return rules
}
