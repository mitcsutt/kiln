import type { NormalisedError } from '#core/binding/errors'
import { resolveMessage, type FormMessages } from '#core/runtime/messages'
import { MAX_PATTERN_INPUT } from '#schema/core/patterns'
import { isNamedValidator } from '#schema/core/registry'
import type { NamedValidator, RuleName, UntypedRule, ValidatorResult } from '#schema/core/types'
import { deepEqual, getPath, isEmptyValue } from '#schema/core/values'

export interface CompileRulesContext {
  /** The kit's validator registry (`custom` rules look up `validator` here). */
  validators: Readonly<Record<string, NamedValidator>>
  messages: FormMessages
  /** The field kind's empty value (§7.1, e.g. `false` for a checkbox); `required` treats it as empty. */
  empty: unknown
}

export type SyncRuleValidator = (value: unknown, values: unknown) => NormalisedError | undefined
export type AsyncRuleValidator = (
  value: unknown,
  values: unknown,
  signal: AbortSignal,
) => Promise<NormalisedError | undefined>

export interface CompiledRules {
  /** Built-in and sync custom rules, in order; the first failure wins. */
  sync?: SyncRuleValidator
  /** `async: true` custom validators, in order. Resolves `undefined` once `signal` aborts. */
  async?: AsyncRuleValidator
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/

/** The date a `'today'` bound resolves to (local calendar date, ISO). */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Compares ISO date / date-time strings on their common prefix (`2026-01-01` vs `2026-01-01T09:00` → equal). */
function compareDates(a: string, b: string): number {
  const length = Math.min(a.length, b.length)
  const left = a.slice(0, length)
  const right = b.slice(0, length)
  return left < right ? -1 : left > right ? 1 : 0
}

function isMultipleOf(value: number, step: number): boolean {
  if (step <= 0) return true
  const ratio = value / step
  return Math.abs(ratio - Math.round(ratio)) < 1e-9
}

function hasDuplicates(items: readonly unknown[], by: string | undefined): boolean {
  const keys = by === undefined ? items : items.map((item) => getPath(item, by))
  return keys.some((key, index) => keys.findIndex((other) => deepEqual(other, key)) !== index)
}

function isEmptyFor(value: unknown, empty: unknown): boolean {
  if (isEmptyValue(value)) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return empty !== undefined && empty !== null && empty !== '' && deepEqual(value, empty)
}

/** `undefined` = the rule passes; otherwise the message params (`{ value }`). */
type Check = (value: unknown, rule: UntypedRule) => Record<string, unknown> | undefined

const fail = (rule: UntypedRule, value: unknown = rule.value): Record<string, unknown> => ({
  value,
})

const checks: Record<Exclude<RuleName, 'required' | 'custom'>, Check> = {
  minLength: (v, r) => (typeof v === 'string' && v.length < Number(r.value) ? fail(r) : undefined),
  maxLength: (v, r) => (typeof v === 'string' && v.length > Number(r.value) ? fail(r) : undefined),
  pattern: (v, r) => (typeof v === 'string' && !patternOf(r).test(v) ? fail(r) : undefined),
  email: (v, r) => (typeof v === 'string' && !EMAIL.test(v) ? fail(r) : undefined),
  url: (v, r) => (typeof v === 'string' && !isUrl(v) ? fail(r) : undefined),
  min: (v, r) => (typeof v === 'number' && v < Number(r.value) ? fail(r) : undefined),
  max: (v, r) => (typeof v === 'number' && v > Number(r.value) ? fail(r) : undefined),
  step: (v, r) =>
    typeof v === 'number' && !isMultipleOf(v, Number(r.value)) ? fail(r) : undefined,
  integer: (v, r) => (typeof v === 'number' && !Number.isInteger(v) ? fail(r) : undefined),
  minItems: (v, r) => (Array.isArray(v) && v.length < Number(r.value) ? fail(r) : undefined),
  maxItems: (v, r) => (Array.isArray(v) && v.length > Number(r.value) ? fail(r) : undefined),
  unique: (v, r) => (Array.isArray(v) && hasDuplicates(v, r.by) ? fail(r) : undefined),
  minDate: (v, r) => {
    const bound = r.value === 'today' ? todayIso() : String(r.value)
    return typeof v === 'string' && DATE_PREFIX.test(v) && compareDates(v, bound) < 0
      ? fail(r, bound)
      : undefined
  },
  maxDate: (v, r) => {
    const bound = r.value === 'today' ? todayIso() : String(r.value)
    return typeof v === 'string' && DATE_PREFIX.test(v) && compareDates(v, bound) > 0
      ? fail(r, bound)
      : undefined
  },
}

const patterns = new WeakMap<UntypedRule, RegExp>()
/** The rule's compiled pattern (cached per rule object). Throws on an invalid pattern. */
function patternOf(rule: UntypedRule): RegExp {
  let re = patterns.get(rule)
  if (!re) {
    re = new RegExp(String(rule.value), rule.flags?.replace(/[gy]/g, ''))
    patterns.set(rule, re)
  }
  return re
}

function messageFor(
  rule: UntypedRule,
  fallback: string,
  messages: FormMessages,
  params: Record<string, unknown>,
): string {
  return resolveMessage(rule.message ?? fallback, messages, params)
}

function builtInError(
  rule: UntypedRule,
  messages: FormMessages,
  params: Record<string, unknown>,
): NormalisedError {
  const name = rule.rule as keyof FormMessages['rules']
  return {
    message: messageFor(rule, messages.rules[name], messages, params),
    code: rule.rule,
    params,
  }
}

function customError(
  rule: UntypedRule,
  result: ValidatorResult,
  messages: FormMessages,
): NormalisedError | undefined {
  if (result === null || result === undefined || result === '') return undefined
  const params = { validator: rule.validator }
  return { message: messageFor(rule, result, messages, params), code: 'custom', params }
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

function lookup(
  validators: CompileRulesContext['validators'],
  key: string | undefined,
): NamedValidator {
  const validator = key === undefined ? undefined : validators[key]
  if (!isNamedValidator(validator)) {
    throw new Error(
      `[@mitcsutt/kiln-forms] Unknown validator "${String(key)}". Register it with kit.extend({ validators }).`,
    )
  }
  return validator
}

/**
 * Compiles JSON rules (§10.4) into one sync and one async field validator. Every rule except
 * `required` skips empty values ('' / null / undefined / []). Messages: `rule.message` (literal or
 * `'$key'`), else `messages.rules[rule]`, with `{value}` interpolated. Unknown validators throw.
 */
export function compileRules(
  rules: readonly UntypedRule[],
  ctx: CompileRulesContext,
): CompiledRules {
  const { messages, empty } = ctx
  const syncSteps: SyncRuleValidator[] = []
  const asyncSteps: { rule: UntypedRule; validator: NamedValidator }[] = []

  for (const rule of rules) {
    if (rule.rule === 'required') {
      syncSteps.push((value) =>
        isEmptyFor(value, empty) ? builtInError(rule, messages, { value: rule.value }) : undefined,
      )
      continue
    }
    if (rule.rule === 'custom') {
      const validator = lookup(ctx.validators, rule.validator)
      if (validator.async) {
        asyncSteps.push({ rule, validator })
        continue
      }
      syncSteps.push((value, values) => {
        if (isEmptyValue(value)) return undefined
        const result = validator.validate(value, { values, args: rule.args })
        if (isThenable(result)) {
          throw new Error(
            `[@mitcsutt/kiln-forms] Validator "${String(rule.validator)}" returned a promise. Define it with defineValidator(fn, { async: true }).`,
          )
        }
        return customError(rule, result, messages)
      })
      continue
    }
    const check = checks[rule.rule]
    if (rule.rule === 'pattern') {
      patternOf(rule) // fail fast on a bad pattern
      // Never run a schema pattern on an unbounded string; a longer value fails like `maxLength`.
      syncSteps.push((value) =>
        typeof value === 'string' && value.length > MAX_PATTERN_INPUT
          ? {
              message: resolveMessage(messages.rules.maxLength, messages, {
                value: MAX_PATTERN_INPUT,
              }),
              code: 'maxLength',
              params: { value: MAX_PATTERN_INPUT },
            }
          : undefined,
      )
    }
    // Count rules judge empty arrays too (`minItems` on [] fails); every other rule skips empties.
    const countsEmpty =
      rule.rule === 'minItems' || rule.rule === 'maxItems' || rule.rule === 'unique'
    syncSteps.push((value) => {
      if (isEmptyValue(value) && !(countsEmpty && Array.isArray(value))) return undefined
      const params = check(value, rule)
      return params ? builtInError(rule, messages, params) : undefined
    })
  }

  const compiled: CompiledRules = {}
  if (syncSteps.length > 0) {
    compiled.sync = (value, values) => {
      for (const step of syncSteps) {
        const error = step(value, values)
        if (error) return error
      }
      return undefined
    }
  }
  if (asyncSteps.length > 0) {
    compiled.async = async (value, values, signal) => {
      if (signal.aborted || isEmptyValue(value)) return undefined
      for (const { rule, validator } of asyncSteps) {
        const result = await validator.validate(value, { values, args: rule.args, signal })
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the signal can abort while the validator is awaited
        if (signal.aborted) return undefined
        const error = customError(rule, result, messages)
        if (error) return error
      }
      return undefined
    }
  }
  return compiled
}

/**
 * The rules a field enforces: its `rules`, plus a leading `required` rule when `required` is true
 * (static `required: true` prop or a true `requiredWhen`) and the rules don't already have one.
 */
export function withRequired(
  rules: readonly UntypedRule[] | undefined,
  required: boolean,
): readonly UntypedRule[] {
  const list = rules ?? []
  if (!required || list.some((rule) => rule.rule === 'required')) return list
  return [{ rule: 'required' }, ...list]
}
