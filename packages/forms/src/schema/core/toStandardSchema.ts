import type { StandardSchemaV1, StandardSchemaV1Issue } from '@tanstack/react-form'
import { mergeMessages, type FormMessages } from '#runtime/messages'
import { evaluateCondition } from '#schema/core/conditions'
import {
  DISABLED,
  EXCLUDED,
  fieldFlags,
  layoutFlags,
  READ_ONLY,
  REQUIRED,
} from '#schema/core/fieldFlags'
import { childNodes, isFieldNode, isLayoutNode, isRepeaterNode } from '#schema/core/nodes'
import {
  compileRules,
  withRequired,
  type AsyncRuleValidator,
  type CompiledRules,
} from '#schema/core/rules'
import type {
  NamedValidator,
  UntypedFormSchema,
  UntypedNode,
  UntypedRule,
} from '#schema/core/types'
import { getPath, joinPath, pathSegments, setPath } from '#schema/core/values'

/**
 * Empty values (§7.1) of default kinds that `required` must treat as empty beyond
 * `'' / null / undefined / []` — an unchecked checkbox or switch.
 */
export const DEFAULT_EMPTIES: Readonly<Record<string, unknown>> = { checkbox: false, switch: false }

export interface ToStandardSchemaOptions {
  /** The kit's validator registry (needed when the schema has `custom` rules). */
  validators?: Readonly<Record<string, NamedValidator>>
  /** The render context conditions read (`{ context: 'mode', … }`). */
  context?: Record<string, unknown>
  messages?: Partial<FormMessages>
  /** kind → empty value for `required` (default `DEFAULT_EMPTIES`). */
  empties?: Readonly<Record<string, unknown>>
}

interface Job {
  path: string
  value: unknown
  run: AsyncRuleValidator
}

/**
 * The schema's rules as a Standard Schema (§10.9), React-free: use it on the server
 * (`createServerValidate`, an API handler) so client and server enforce the same rules.
 *
 * Applies `rules` (+ `required` / `requiredWhen`) of **visible, active** fields only, using the same
 * `fieldFlags` as the renderer: nodes whose `when` is false are skipped with their subtree, as are
 * fields that are excluded, disabled or read-only — by their own static prop, a `*When` condition,
 * `compute`, or an ancestor `section`'s `disabled` / `readOnly` (`layoutFlags`). Those are the
 * fields the client doesn't validate (§5.4). A repeater under such a section is skipped whole, and
 * so is every `review` subtree (view mode never validates; the field's own node counts).
 * Repeater rules apply to the array and item rules to each item. `warnRules` never fail. Returns a
 * promise only when async custom validators run.
 *
 * Success output holds only the schema's active fields: unknown keys and the
 * values of hidden, excluded, disabled, read-only and computed fields are dropped, never passed
 * through — the server must not trust them (recompute a computed value if it needs one). A
 * repeater keeps one object per input item with that item's active fields.
 */
export function toStandardSchema(
  schema: UntypedFormSchema,
  opts: ToStandardSchemaOptions = {},
): StandardSchemaV1<unknown, unknown> {
  const validators = opts.validators ?? {}
  const context = opts.context ?? {}
  const messages = mergeMessages(opts.messages)
  const empties = opts.empties ?? DEFAULT_EMPTIES
  const compiled = new Map<readonly UntypedRule[], Map<unknown, CompiledRules>>()
  const noRules: readonly UntypedRule[] = []

  const compile = (rules: readonly UntypedRule[], empty: unknown): CompiledRules => {
    let byEmpty = compiled.get(rules)
    if (!byEmpty) {
      byEmpty = new Map()
      compiled.set(rules, byEmpty)
    }
    let result = byEmpty.get(empty)
    if (!result) {
      result = compileRules(rules, { validators, messages, empty })
      byEmpty.set(empty, result)
    }
    return result
  }
  // `withRequired` returns a new array; key the cache on the source rules + required flag instead.
  const requiredRules = new Map<readonly UntypedRule[], readonly UntypedRule[]>()
  const effectiveRules = (
    rules: readonly UntypedRule[] | undefined,
    required: boolean,
  ): readonly UntypedRule[] => {
    const source = rules ?? noRules
    if (!required) return source
    let list = requiredRules.get(source)
    if (!list) {
      list = withRequired(source, true)
      requiredRules.set(source, list)
    }
    return list
  }

  const validate = (input: unknown) => {
    const issues: StandardSchemaV1Issue[] = []
    const jobs: Job[] = []
    // A field rendered twice (e.g. again inside a `review`) is checked once per path.
    const checked = new Set<string>()
    const is = (c: Parameters<typeof evaluateCondition>[0] | undefined): boolean =>
      c !== undefined && evaluateCondition(c, input, context)

    const check = (path: string, rules: readonly UntypedRule[], empty: unknown) => {
      if (rules.length === 0 || checked.has(path)) return
      checked.add(path)
      const value = getPath(input, path)
      const { sync, async } = compile(rules, empty)
      const error = sync?.(value, input)
      if (error) issues.push({ message: error.message, path: pathSegments(path) })
      else if (async) jobs.push({ path, value, run: async })
    }

    // Only known, active paths are copied into the output.
    const output: Record<string, unknown> = {}
    const keep = (path: string, value: unknown) => {
      if (value !== undefined) setPath(output, path, value)
    }

    const visit = (node: UntypedNode, prefix: string, inherited: number): void => {
      if (node.when && !is(node.when)) return
      if (isFieldNode(node)) {
        const flags = fieldFlags(node, input, context, inherited)
        // Inactive on the client (§5.4): never validated there, so never trusted here.
        if ((flags & (EXCLUDED | DISABLED | READ_ONLY)) !== 0) return
        const path = joinPath(prefix, node.name)
        check(path, effectiveRules(node.rules, (flags & REQUIRED) !== 0), empties[node.kind])
        keep(path, getPath(input, path))
        return
      }
      if (isRepeaterNode(node)) {
        if ((inherited & (EXCLUDED | DISABLED | READ_ONLY)) !== 0) return
        const path = joinPath(prefix, node.name)
        check(path, node.rules ?? noRules, undefined)
        const items = getPath(input, path)
        if (!Array.isArray(items)) {
          keep(path, items)
          return
        }
        keep(
          path,
          items.map(() => ({})),
        )
        items.forEach((_, index) => {
          for (const child of node.item) visit(child, `${path}[${String(index)}]`, inherited)
        })
        return
      }
      // A review re-renders fields in view mode, which never validates: it adds no rules and no
      // output (the field's real node decides both, with its inherited flags).
      if (isLayoutNode(node) && node.layout === 'review') return
      const passed = inherited | layoutFlags(node)
      for (const child of childNodes(node)) visit(child, prefix, passed)
    }

    visit(schema.root, '', 0)
    const done = () => (issues.length > 0 ? { issues } : { value: output })
    if (jobs.length === 0) return done()
    const signal = new AbortController().signal
    return Promise.all(jobs.map((job) => job.run(job.value, input, signal))).then((errors) => {
      errors.forEach((error, index) => {
        const job = jobs[index]
        if (error && job) issues.push({ message: error.message, path: pathSegments(job.path) })
      })
      return done()
    })
  }

  return { '~standard': { version: 1, vendor: '@mitcsutt/kiln-forms', validate } }
}
