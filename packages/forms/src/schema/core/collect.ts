import { conditionDeps } from '#schema/core/conditions'
import { childNodes, isFieldNode, isRepeaterNode, nodeConditions } from '#schema/core/nodes'
import type { UntypedFormSchema, UntypedNode, UntypedRepeaterNode } from '#schema/core/types'
import { joinPath, setPath } from '#schema/core/values'

/** Static facts about a schema, computed once per schema identity (§10.6). */
export interface SchemaAnalysis {
  /**
   * Field names in a node's subtree, for static scope lists and hidden-subtree pruning. A repeater
   * contributes its array name (its items live under it). Names are relative to the node's scope:
   * absolute at the root, item-relative inside a repeater item — pass the item path
   * (`'guests[2]'`) as `prefix` to make them absolute.
   */
  names: (node: UntypedNode, prefix?: string) => readonly string[]
  /** Value paths the node's own conditions read (`when`, `disabledWhen`, `readOnlyWhen`, `excludeWhen`, `requiredWhen`). */
  deps: (node: UntypedNode) => readonly string[]
  /** Nodes by `id` (first wins; `parseFormSchema` rejects duplicates). */
  nodeById: Map<string, UntypedNode>
  /** Field-level `defaultValue`s of root-scope fields, by name. */
  defaults: Record<string, unknown>
  /** The repeater whose `item` template a node sits in (nearest), if any. */
  repeaterOf: (node: UntypedNode) => UntypedRepeaterNode | undefined
}

const cache = new WeakMap<UntypedFormSchema, SchemaAnalysis>()

function analyse(schema: UntypedFormSchema): SchemaAnalysis {
  const nodeById = new Map<string, UntypedNode>()
  const defaults: Record<string, unknown> = {}
  const repeaters = new Map<UntypedNode, UntypedRepeaterNode>()
  const namesCache = new Map<UntypedNode, readonly string[]>()
  const depsCache = new Map<UntypedNode, readonly string[]>()

  const walk = (node: UntypedNode, repeater: UntypedRepeaterNode | undefined): void => {
    if (node.id !== undefined && !nodeById.has(node.id)) nodeById.set(node.id, node)
    if (repeater) repeaters.set(node, repeater)
    if (
      isFieldNode(node) &&
      !repeater &&
      node.defaultValue !== undefined &&
      !(node.name in defaults)
    ) {
      defaults[node.name] = node.defaultValue
    }
    const inner = isRepeaterNode(node) ? node : repeater
    for (const child of childNodes(node)) walk(child, inner)
  }
  walk(schema.root, undefined)

  const relativeNames = (node: UntypedNode): readonly string[] => {
    const cached = namesCache.get(node)
    if (cached) return cached
    let names: readonly string[]
    if (isFieldNode(node) || isRepeaterNode(node)) names = [node.name]
    else names = [...new Set(childNodes(node).flatMap((child) => relativeNames(child)))]
    namesCache.set(node, names)
    return names
  }

  return {
    names: (node, prefix = '') => {
      const names = relativeNames(node)
      return prefix === '' ? names : names.map((name) => joinPath(prefix, name))
    },
    deps: (node) => {
      const cached = depsCache.get(node)
      if (cached) return cached
      const deps = [
        ...new Set(Object.values(nodeConditions(node)).flatMap((c) => conditionDeps(c))),
      ]
      depsCache.set(node, deps)
      return deps
    },
    nodeById,
    defaults,
    repeaterOf: (node) => repeaters.get(node),
  }
}

/** Static analysis of a schema (names per subtree, condition deps, ids, defaults). Cached per schema object. */
export function analyseSchema(schema: UntypedFormSchema): SchemaAnalysis {
  let analysis = cache.get(schema)
  if (!analysis) {
    analysis = analyse(schema)
    cache.set(schema, analysis)
  }
  return analysis
}

/**
 * Initial values for a schema of unknown shape (server-driven forms, §10.8): each root-scope field
 * gets its `defaultValue`, else `empties[kind]` when given; each repeater gets `[]`.
 */
export function schemaDefaultValues(
  schema: UntypedFormSchema,
  empties: Readonly<Record<string, unknown>> = {},
): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  // A name rendered twice: a `defaultValue` beats a kind empty; otherwise the first one wins.
  const fromDefault = new Set<string>()
  const assigned = new Set<string>()
  const assign = (name: string, value: unknown, isDefault: boolean) => {
    if (fromDefault.has(name) || (!isDefault && assigned.has(name))) return
    setPath(values, name, structuredClone(value))
    assigned.add(name)
    if (isDefault) fromDefault.add(name)
  }
  const walk = (node: UntypedNode): void => {
    if (isRepeaterNode(node)) {
      assign(node.name, [], false)
      return
    }
    if (isFieldNode(node)) {
      if (node.defaultValue !== undefined) assign(node.name, node.defaultValue, true)
      else if (Object.prototype.hasOwnProperty.call(empties, node.kind))
        assign(node.name, empties[node.kind], false)
      return
    }
    for (const child of childNodes(node)) walk(child)
  }
  walk(schema.root)
  return values
}
