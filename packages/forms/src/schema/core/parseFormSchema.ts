import { CONTENT_SCHEMA_KEYS, FIELD_SCHEMA_KEYS, LAYOUT_SCHEMA_KEYS } from '#schema/core/nodes'
import type {
  ConditionOp,
  ContentKind,
  DefaultLayoutKey,
  RuleName,
  UntypedFormSchema,
} from '#schema/core/types'
import { unsafePatternReason } from '#schema/core/patterns'
import { unsafePropReason } from '#schema/core/unsafeProps'
import { unsafePathSegment } from '#schema/core/values'

/** Registered keys: an array of names or the registry object itself (its keys are used). */
export type RegistryNames = readonly string[] | Readonly<Record<string, unknown>>

/** What a server-driven schema may reference (§10.8). `layouts` adds to the default layouts. */
export interface SchemaRegistryNames {
  kinds: RegistryNames
  layouts?: RegistryNames
  loaders?: RegistryNames
  validators?: RegistryNames
  computers?: RegistryNames
  nodes?: RegistryNames
}

/** Options for `parseFormSchema`. */
export interface ParseFormSchemaOptions {
  /**
   * Accept literal `pattern` rules. Default `false`: a regex from untrusted JSON can take
   * exponential time, and no heuristic catches every slow one. Pass `true` only for a trusted
   * source (your own CMS, fixtures). `unsafePatternReason` then rejects the obvious slow shapes,
   * but it is a heuristic: some slow patterns get past it (`^` + `\d{0,10}` ×10 + `x$`), so it is no
   * substitute for trusting the source.
   * Untrusted schemas use a registered named validator (`{ rule: 'custom', validator: 'email' }`).
   */
  allowPatterns?: boolean
}

/** The issue for a literal `pattern` rule when `allowPatterns` is off. */
export const PATTERN_NOT_ALLOWED =
  "pattern rules aren't allowed in parsed schemas; register a named validator, or pass allowPatterns for trusted sources"

export interface SchemaIssue {
  /** Where, e.g. `root.children[2].kind`. */
  path: string
  message: string
}

export type ParseFormSchemaResult =
  { ok: true; schema: UntypedFormSchema } | { ok: false; issues: readonly SchemaIssue[] }

/** The default layout keys (§9, §10.11) — always allowed. `repeater` is its own node shape. */
export const DEFAULT_LAYOUT_KEYS: readonly DefaultLayoutKey[] = [
  'stack',
  'inline',
  'grid',
  'gridItem',
  'section',
  'aside',
  'rows',
  'panels',
  'panel',
  'tabs',
  'tab',
  'accordion',
  'accordionItem',
  'steps',
  'step',
  'sentence',
  'review',
  'actions',
]

/** Required text props of the default layouts. */
const REQUIRED_LAYOUT_TEXT: Partial<Record<DefaultLayoutKey, readonly string[]>> = {
  section: ['title'],
  aside: ['title'],
  panel: ['title'],
  tabs: ['label'],
  tab: ['value', 'label'],
  accordionItem: ['value', 'title'],
  step: ['value', 'title'],
  sentence: ['label'],
}

const CONTENT_KINDS: readonly ContentKind[] = [
  'heading',
  'text',
  'alert',
  'divider',
  'submit',
  'reset',
  'errorSummary',
  'status',
]
const ALERT_TONES = ['info', 'positive', 'caution', 'critical', 'neutral']
/** Repeater table column widths (ui `TableColumnWidth`). */
const COLUMN_WIDTHS = ['fill', 'min']
const FIELD_OPS: readonly ConditionOp[] = [
  'eq',
  'neq',
  'in',
  'notIn',
  'truthy',
  'falsy',
  'empty',
  'notEmpty',
  'gt',
  'gte',
  'lt',
  'lte',
]
const CONTEXT_OPS: readonly ConditionOp[] = ['eq', 'neq', 'in']
const RULES: readonly RuleName[] = [
  'required',
  'custom',
  'minLength',
  'maxLength',
  'pattern',
  'email',
  'url',
  'min',
  'max',
  'step',
  'integer',
  'minItems',
  'maxItems',
  'unique',
  'minDate',
  'maxDate',
]
const COUNT_RULES: readonly RuleName[] = ['minLength', 'maxLength', 'minItems', 'maxItems']
const DATE = /^\d{4}-\d{2}-\d{2}/
const WHEN_HIDDEN = ['prune', 'keep', 'reset']
const DISCRIMINANTS = ['kind', 'layout', 'content', 'custom'] as const

/** Resource limits for untrusted schemas. Each breach is an issue, never a throw. */
export const SCHEMA_LIMITS = {
  /** Deepest node nesting (root = 1), and deepest condition nesting (`all`/`any`/`not`). */
  maxDepth: 64,
  /** Most nodes in one schema. */
  maxNodes: 2000,
  /** Deepest nesting inside one JSON prop value (`defaultValue`, `newItem`, `options`, …). */
  maxJsonDepth: 64,
} as const

type Obj = Record<string, unknown>

function isObject(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function names(registry: RegistryNames | undefined): ReadonlySet<string> {
  if (!registry) return new Set()
  return new Set(Array.isArray(registry) ? (registry as readonly string[]) : Object.keys(registry))
}
const quote = (value: unknown) =>
  typeof value === 'string'
    ? `"${value}"`
    : // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- JSON.stringify returns undefined for undefined and functions
      String(JSON.stringify(value))

interface Ctx {
  issues: SchemaIssue[]
  kinds: ReadonlySet<string>
  layouts: ReadonlySet<string>
  loaders: ReadonlySet<string>
  validators: ReadonlySet<string>
  computers: ReadonlySet<string>
  nodes: ReadonlySet<string>
  ids: Set<string>
  /** Nodes seen so far (`SCHEMA_LIMITS.maxNodes`). */
  count: number
  allowPatterns: boolean
}

function issue(ctx: Ctx, path: string, message: string): void {
  ctx.issues.push({ path, message })
}

/** `isJson` with a nesting limit, so hostile input can't exhaust the stack: deeper than `depth` → false. */
function isJson(value: unknown, depth: number = SCHEMA_LIMITS.maxJsonDepth): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'object' || depth <= 0) return false
  if (Array.isArray(value)) return value.every((item) => isJson(item, depth - 1))
  const proto: unknown = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) return false
  return Object.values(value).every((item) => isJson(item, depth - 1))
}
const JSON_HINT = `functions, objects with methods and values nested over ${String(SCHEMA_LIMITS.maxJsonDepth)} levels are not allowed`

/** Reports a prototype-reaching segment (`__proto__`, `prototype`, `constructor`) in a value path. */
function checkSafePath(ctx: Ctx, value: string, path: string): boolean {
  const unsafe = unsafePathSegment(value)
  if (unsafe === undefined) return true
  issue(ctx, path, `Path segment "${unsafe}" is not allowed`)
  return false
}

function checkStringArray(ctx: Ctx, value: unknown, path: string, required = false): void {
  if (value === undefined) {
    if (required) issue(ctx, path, 'Expected an array of field names')
    return
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string' && item !== '')) {
    issue(ctx, path, 'Expected an array of field names')
    return
  }
  value.forEach((item: string, index) => checkSafePath(ctx, item, `${path}[${String(index)}]`))
}

function checkCondition(ctx: Ctx, c: unknown, path: string, depth = 1): void {
  if (depth > SCHEMA_LIMITS.maxDepth) {
    issue(
      ctx,
      path,
      `Conditions are nested more than ${String(SCHEMA_LIMITS.maxDepth)} levels deep`,
    )
    return
  }
  if (!isObject(c)) {
    issue(ctx, path, 'Expected a condition object')
    return
  }
  for (const key of ['all', 'any'] as const) {
    if (!(key in c)) continue
    const list = c[key]
    if (!Array.isArray(list)) {
      issue(ctx, `${path}.${key}`, 'Expected an array of conditions')
      return
    }
    list.forEach((child, index) => {
      checkCondition(ctx, child, `${path}.${key}[${String(index)}]`, depth + 1)
    })
    return
  }
  if ('not' in c) {
    checkCondition(ctx, c.not, `${path}.not`, depth + 1)
    return
  }
  const isField = 'field' in c
  if (!isField && !('context' in c)) {
    issue(ctx, path, 'Condition needs one of field, context, all, any or not')
    return
  }
  const target = isField ? c.field : c.context
  if (typeof target !== 'string' || target === '') {
    issue(ctx, `${path}.${isField ? 'field' : 'context'}`, 'Expected a non-empty string')
  } else if (isField) {
    checkSafePath(ctx, target, `${path}.field`)
  }
  const ops = isField ? FIELD_OPS : CONTEXT_OPS
  const op = c.op
  if (typeof op !== 'string' || !ops.includes(op as ConditionOp)) {
    issue(ctx, `${path}.op`, `Unknown condition operator ${quote(op)}`)
    return
  }
  if (op === 'in' || op === 'notIn') {
    if (!Array.isArray(c.value) || !isJson(c.value))
      issue(ctx, `${path}.value`, `Operator "${op}" needs an array value`)
  } else if (op === 'gt' || op === 'gte' || op === 'lt' || op === 'lte') {
    if (typeof c.value !== 'number' || !Number.isFinite(c.value))
      issue(ctx, `${path}.value`, `Operator "${op}" needs a number value`)
  } else if (op === 'eq' || op === 'neq') {
    if (!('value' in c) || !isJson(c.value))
      issue(ctx, `${path}.value`, `Operator "${op}" needs a JSON value`)
  }
}

function checkRules(ctx: Ctx, rules: unknown, path: string): void {
  if (rules === undefined) return
  if (!Array.isArray(rules)) {
    issue(ctx, path, 'Expected an array of rules')
    return
  }
  rules.forEach((rule: unknown, index) => {
    const at = `${path}[${String(index)}]`
    if (!isObject(rule)) {
      issue(ctx, at, 'Expected a rule object')
      return
    }
    const name = rule.rule
    if (typeof name !== 'string' || !RULES.includes(name as RuleName)) {
      issue(ctx, `${at}.rule`, `Unknown rule ${quote(name)}`)
      return
    }
    if (rule.message !== undefined && typeof rule.message !== 'string')
      issue(ctx, `${at}.message`, 'Expected a string')
    const value = rule.value
    if (COUNT_RULES.includes(name as RuleName)) {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
        issue(ctx, `${at}.value`, `Rule "${name}" needs a whole number of 0 or more`)
      }
    } else if (name === 'min' || name === 'max') {
      if (typeof value !== 'number' || !Number.isFinite(value))
        issue(ctx, `${at}.value`, `Rule "${name}" needs a number`)
    } else if (name === 'step') {
      if (typeof value !== 'number' || !(value > 0))
        issue(ctx, `${at}.value`, 'Rule "step" needs a number above 0')
    } else if (name === 'pattern') {
      if (!ctx.allowPatterns) {
        issue(ctx, `${at}.rule`, PATTERN_NOT_ALLOWED)
        return
      }
      if (typeof value !== 'string') {
        issue(ctx, `${at}.value`, 'Rule "pattern" needs a string')
        return
      }
      if (rule.flags !== undefined && typeof rule.flags !== 'string') {
        issue(ctx, `${at}.flags`, 'Expected a string')
        return
      }
      const unsafe = unsafePatternReason(value)
      if (unsafe !== undefined) {
        issue(ctx, `${at}.value`, unsafe)
        return
      }
      try {
        new RegExp(value, rule.flags)
      } catch {
        issue(ctx, `${at}.value`, `Invalid pattern ${quote(value)}`)
      }
    } else if (name === 'minDate' || name === 'maxDate') {
      if (typeof value !== 'string' || (value !== 'today' && !DATE.test(value))) {
        issue(ctx, `${at}.value`, `Rule "${name}" needs an ISO date (YYYY-MM-DD) or "today"`)
      }
    } else if (name === 'custom') {
      if (typeof rule.validator !== 'string' || !ctx.validators.has(rule.validator)) {
        issue(ctx, `${at}.validator`, `Unknown validator ${quote(rule.validator)}`)
      }
      if (rule.args !== undefined && !isJson(rule.args)) issue(ctx, `${at}.args`, 'Expected JSON')
    } else if (name === 'unique') {
      if (rule.by !== undefined && typeof rule.by !== 'string')
        issue(ctx, `${at}.by`, 'Expected a string')
      else if (typeof rule.by === 'string') checkSafePath(ctx, rule.by, `${at}.by`)
    }
  })
}

function checkProps(
  ctx: Ctx,
  node: Obj,
  path: string,
  schemaKeys: readonly string[],
  onField = false,
): void {
  for (const [key, value] of Object.entries(node)) {
    if (schemaKeys.includes(key)) continue
    const unsafe = unsafePropReason(key, value, onField)
    if (unsafe !== undefined) issue(ctx, `${path}.${key}`, unsafe)
    else if (!isJson(value)) issue(ctx, `${path}.${key}`, `Expected a JSON value (${JSON_HINT})`)
  }
}

function checkOptions(ctx: Ctx, options: unknown, path: string): void {
  if (options === undefined) return
  if (!Array.isArray(options)) {
    issue(ctx, path, 'Expected an array of options')
    return
  }
  options.forEach((option: unknown, index) => {
    const ok =
      isObject(option) &&
      ['string', 'number', 'boolean'].includes(typeof option.value) &&
      typeof option.label === 'string'
    if (!ok)
      issue(
        ctx,
        `${path}[${String(index)}]`,
        'Option needs a value (string, number or boolean) and a label',
      )
  })
}

function checkWhenHidden(ctx: Ctx, value: unknown, path: string): void {
  if (value !== undefined && !WHEN_HIDDEN.includes(value as string)) {
    issue(ctx, path, `Expected "prune", "keep" or "reset"`)
  }
}

/** Claims `name` in a scope; reports duplicates. */
function claimName(ctx: Ctx, scope: Set<string>, name: unknown, path: string): void {
  if (typeof name !== 'string' || name === '' || /\s/.test(name)) {
    issue(ctx, path, 'Expected a field name (no spaces)')
    return
  }
  if (!checkSafePath(ctx, name, path)) return
  if (scope.has(name)) {
    issue(ctx, path, `Duplicate field name ${quote(name)}`)
    return
  }
  scope.add(name)
}

function checkField(ctx: Ctx, node: Obj, path: string, scope: Set<string>): void {
  if (typeof node.kind !== 'string' || !ctx.kinds.has(node.kind)) {
    issue(ctx, `${path}.kind`, `Unknown field kind ${quote(node.kind)}`)
  }
  claimName(ctx, scope, node.name, `${path}.name`)
  checkRules(ctx, node.rules, `${path}.rules`)
  checkRules(ctx, node.warnRules, `${path}.warnRules`)
  if (node.defaultValue !== undefined && !isJson(node.defaultValue))
    issue(ctx, `${path}.defaultValue`, 'Expected a JSON value')
  checkWhenHidden(ctx, node.whenHidden, `${path}.whenHidden`)
  for (const key of ['disabledWhen', 'readOnlyWhen', 'excludeWhen', 'requiredWhen'] as const) {
    if (node[key] !== undefined) checkCondition(ctx, node[key], `${path}.${key}`)
  }
  if (node.optionsFrom !== undefined) {
    const from = node.optionsFrom
    if (!isObject(from)) issue(ctx, `${path}.optionsFrom`, 'Expected { loader, deps? }')
    else {
      if (typeof from.loader !== 'string' || !ctx.loaders.has(from.loader)) {
        issue(ctx, `${path}.optionsFrom.loader`, `Unknown loader ${quote(from.loader)}`)
      }
      checkStringArray(ctx, from.deps, `${path}.optionsFrom.deps`)
    }
  }
  checkStringArray(ctx, node.resets, `${path}.resets`)
  if (node.compute !== undefined) {
    const compute = node.compute
    if (!isObject(compute)) issue(ctx, `${path}.compute`, 'Expected { computer, from }')
    else {
      if (typeof compute.computer !== 'string' || !ctx.computers.has(compute.computer)) {
        issue(ctx, `${path}.compute.computer`, `Unknown computer ${quote(compute.computer)}`)
      }
      checkStringArray(ctx, compute.from, `${path}.compute.from`, true)
    }
  }
  checkOptions(ctx, node.options, `${path}.options`)
  checkProps(ctx, node, path, FIELD_SCHEMA_KEYS, true)
}

function checkChildren(
  ctx: Ctx,
  list: unknown,
  path: string,
  scope: Set<string>,
  what: string,
  depth: number,
): void {
  if (!Array.isArray(list)) {
    issue(ctx, path, `Expected an array of ${what}`)
    return
  }
  list.forEach((child, index) => {
    checkNode(ctx, child, `${path}[${String(index)}]`, scope, depth + 1)
  })
}

function checkColumns(ctx: Ctx, columns: unknown, path: string): void {
  if (columns === undefined) return
  if (!Array.isArray(columns)) {
    issue(ctx, path, 'Expected an array of columns')
    return
  }
  columns.forEach((column: unknown, index) => {
    const at = `${path}[${String(index)}]`
    if (!isObject(column)) {
      issue(ctx, at, 'Expected a column object')
      return
    }
    if (typeof column.header !== 'string')
      issue(ctx, `${at}.header`, 'Column needs a header (text)')
    if (column.width !== undefined && !COLUMN_WIDTHS.includes(column.width as string)) {
      issue(
        ctx,
        `${at}.width`,
        `Unknown column width ${quote(column.width)} (expected "fill" or "min")`,
      )
    }
  })
}

function checkRepeater(ctx: Ctx, node: Obj, path: string, scope: Set<string>, depth: number): void {
  claimName(ctx, scope, node.name, `${path}.name`)
  if (typeof node.label !== 'string') issue(ctx, `${path}.label`, 'Repeater needs a label')
  if (!('newItem' in node)) issue(ctx, path, 'Repeater needs newItem (the value of an added item)')
  else if (!isObject(node.newItem) || !isJson(node.newItem))
    issue(ctx, `${path}.newItem`, 'Expected a JSON object')
  checkColumns(ctx, node.columns, `${path}.columns`)
  checkRules(ctx, node.rules, `${path}.rules`)
  checkWhenHidden(ctx, node.whenHidden, `${path}.whenHidden`)
  checkChildren(ctx, node.item, `${path}.item`, new Set(), 'item nodes', depth)
  checkProps(ctx, node, path, LAYOUT_SCHEMA_KEYS)
}

function checkLayout(ctx: Ctx, node: Obj, path: string, scope: Set<string>, depth: number): void {
  const layout = node.layout
  if (typeof layout !== 'string' || !ctx.layouts.has(layout)) {
    issue(ctx, `${path}.layout`, `Unknown layout ${quote(layout)}`)
  } else {
    for (const key of REQUIRED_LAYOUT_TEXT[layout as DefaultLayoutKey] ?? []) {
      if (typeof node[key] !== 'string')
        issue(ctx, `${path}.${key}`, `Layout "${layout}" needs a ${key} (text)`)
    }
  }
  // A review (view mode, §9.11) re-renders fields shown elsewhere: its names get their own scope.
  const childScope = layout === 'review' ? new Set<string>() : scope
  checkChildren(ctx, node.children, `${path}.children`, childScope, 'child nodes', depth)
  checkProps(ctx, node, path, LAYOUT_SCHEMA_KEYS)
}

function checkContent(ctx: Ctx, node: Obj, path: string): void {
  const content = node.content
  if (typeof content !== 'string' || !CONTENT_KINDS.includes(content as ContentKind)) {
    issue(ctx, `${path}.content`, `Unknown content ${quote(content)}`)
    return
  }
  if (
    (content === 'heading' || content === 'text' || content === 'alert') &&
    typeof node.text !== 'string'
  ) {
    issue(ctx, `${path}.text`, `Content "${content}" needs text`)
  }
  if (
    content === 'heading' &&
    node.level !== undefined &&
    ![2, 3, 4].includes(node.level as number)
  ) {
    issue(ctx, `${path}.level`, 'Expected 2, 3 or 4')
  }
  if (
    content === 'alert' &&
    node.tone !== undefined &&
    !ALERT_TONES.includes(node.tone as string)
  ) {
    issue(ctx, `${path}.tone`, `Unknown tone ${quote(node.tone)}`)
  }
  checkProps(ctx, node, path, CONTENT_SCHEMA_KEYS)
}

function checkCustom(ctx: Ctx, node: Obj, path: string): void {
  if (typeof node.custom !== 'string' || !ctx.nodes.has(node.custom)) {
    issue(ctx, `${path}.custom`, `Unknown custom node ${quote(node.custom)}`)
  }
  if (node.props !== undefined && (!isObject(node.props) || !isJson(node.props))) {
    issue(ctx, `${path}.props`, 'Expected a JSON object')
  }
  for (const key of Object.keys(node)) {
    if (!['custom', 'props', 'id', 'when'].includes(key))
      issue(ctx, `${path}.${key}`, `Unexpected key ${quote(key)} (put custom node data in props)`)
  }
}

function checkNode(ctx: Ctx, node: unknown, path: string, scope: Set<string>, depth: number): void {
  if (depth > SCHEMA_LIMITS.maxDepth) {
    issue(ctx, path, `Nodes are nested more than ${String(SCHEMA_LIMITS.maxDepth)} levels deep`)
    return
  }
  ctx.count += 1
  if (ctx.count > SCHEMA_LIMITS.maxNodes) {
    if (ctx.count === SCHEMA_LIMITS.maxNodes + 1)
      issue(ctx, path, `Schema has more than ${String(SCHEMA_LIMITS.maxNodes)} nodes`)
    return
  }
  if (!isObject(node)) {
    issue(ctx, path, 'Expected a node object')
    return
  }
  // A field may carry a `layout` prop ('stack' | 'horizontal' | 'inline'): `kind` wins over it.
  const kinds = DISCRIMINANTS.filter((key) => key in node && !(key === 'layout' && 'kind' in node))
  if (kinds.length === 0) {
    issue(ctx, path, 'Node needs one of kind, layout, content or custom')
    return
  }
  if (kinds.length > 1) {
    issue(ctx, path, `Node has more than one of ${kinds.join(', ')}`)
    return
  }
  if (node.id !== undefined) {
    if (typeof node.id !== 'string' || node.id === '')
      issue(ctx, `${path}.id`, 'Expected a non-empty string')
    else if (ctx.ids.has(node.id)) issue(ctx, `${path}.id`, `Duplicate node id ${quote(node.id)}`)
    else ctx.ids.add(node.id)
  }
  if (node.when !== undefined) checkCondition(ctx, node.when, `${path}.when`)
  if ('kind' in node) checkField(ctx, node, path, scope)
  else if (node.layout === 'repeater') checkRepeater(ctx, node, path, scope, depth)
  else if ('layout' in node) checkLayout(ctx, node, path, scope, depth)
  else if ('content' in node) checkContent(ctx, node, path)
  else checkCustom(ctx, node, path)
}

/**
 * Validates untrusted JSON as a form schema against the kit's registered keys: node shapes,
 * field kinds / layouts / loaders / validators / computers / custom nodes, rule names and argument
 * types, condition shapes, duplicate ids and field names, repeater `newItem`, JSON-only props.
 * Untrusted input: rejects DOM-sink props (`dangerouslySetInnerHTML`, `on*`, `style`,
 * `javascript:` URLs, … — `unsafeProps.ts`), schemas over `SCHEMA_LIMITS`, and literal `pattern`
 * rules unless `options.allowPatterns` (then slow-looking patterns are still rejected).
 * Never throws on hostile JSON: every problem is an issue with its path.
 * Hand-written (no zod at runtime). On success returns the same object, typed `UntypedFormSchema`.
 *
 * @privateRemarks Design reference §10.8.
 */
export function parseFormSchema(
  json: unknown,
  registry: SchemaRegistryNames,
  options: ParseFormSchemaOptions = {},
): ParseFormSchemaResult {
  const ctx: Ctx = {
    issues: [],
    kinds: names(registry.kinds),
    layouts: new Set([...DEFAULT_LAYOUT_KEYS, ...names(registry.layouts)]),
    loaders: names(registry.loaders),
    validators: names(registry.validators),
    computers: names(registry.computers),
    nodes: names(registry.nodes),
    ids: new Set(),
    count: 0,
    allowPatterns: options.allowPatterns === true,
  }
  if (!isObject(json))
    return { ok: false, issues: [{ path: '', message: 'Expected a schema object' }] }
  if (json.version !== 1) issue(ctx, 'version', 'Expected version 1')
  if (json.title !== undefined && typeof json.title !== 'string')
    issue(ctx, 'title', 'Expected a string')
  if (json.description !== undefined && typeof json.description !== 'string')
    issue(ctx, 'description', 'Expected a string')
  if (!('root' in json)) issue(ctx, 'root', 'Schema needs a root node')
  else {
    try {
      checkNode(ctx, json.root, 'root', new Set(), 1)
    } catch (error) {
      // The limits above bound recursion; this is the last line of the "returns issues" contract.
      if (!(error instanceof RangeError)) throw error
      issue(ctx, 'root', 'Schema is nested too deeply to check')
    }
  }
  if (ctx.issues.length > 0) return { ok: false, issues: ctx.issues }
  return { ok: true, schema: json as unknown as UntypedFormSchema }
}
