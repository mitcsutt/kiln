import type {
  UntypedCondition,
  UntypedContextCondition,
  UntypedFieldCondition,
} from '#schema/core/types'
import { deepEqual, getPath, isEmptyValue } from '#schema/core/values'

function isFieldCondition(c: UntypedCondition): c is UntypedFieldCondition {
  return 'field' in c
}
function isContextCondition(c: UntypedCondition): c is UntypedContextCondition {
  return 'context' in c
}

function includes(list: unknown, value: unknown): boolean {
  return Array.isArray(list) && list.some((item) => deepEqual(item, value))
}

function compare(actual: unknown, op: 'gt' | 'gte' | 'lt' | 'lte', expected: unknown): boolean {
  if (typeof actual !== 'number' || Number.isNaN(actual) || typeof expected !== 'number')
    return false
  switch (op) {
    case 'gt':
      return actual > expected
    case 'gte':
      return actual >= expected
    case 'lt':
      return actual < expected
    case 'lte':
      return actual <= expected
  }
}

function evaluateField(c: UntypedFieldCondition, values: unknown): boolean {
  const actual = getPath(values, c.field)
  switch (c.op) {
    case 'eq':
      return deepEqual(actual, c.value)
    case 'neq':
      return !deepEqual(actual, c.value)
    case 'in':
      return includes(c.value, actual)
    case 'notIn':
      return !includes(c.value, actual)
    // `truthy` = JS-truthy and not an empty array (an empty selection reads as "nothing chosen").
    case 'truthy':
      return Boolean(actual) && !isEmptyValue(actual)
    case 'falsy':
      return !actual || isEmptyValue(actual)
    case 'empty':
      return isEmptyValue(actual)
    case 'notEmpty':
      return !isEmptyValue(actual)
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return compare(actual, c.op, c.value)
  }
}

function evaluateContext(c: UntypedContextCondition, context: Record<string, unknown>): boolean {
  const actual = context[c.context]
  switch (c.op) {
    case 'eq':
      return deepEqual(actual, c.value)
    case 'neq':
      return !deepEqual(actual, c.value)
    case 'in':
      return includes(c.value, actual)
  }
}

/**
 * Evaluates a JSON condition against form values (root paths) and the render context.
 * Pure: no React, no form instance. `all: []` is true, `any: []` is false.
 *
 * @privateRemarks Design reference §10.3.
 */
export function evaluateCondition(
  c: UntypedCondition,
  values: unknown,
  context: Record<string, unknown> = {},
): boolean {
  if ('all' in c) return c.all.every((child) => evaluateCondition(child, values, context))
  if ('any' in c) return c.any.some((child) => evaluateCondition(child, values, context))
  if ('not' in c) return !evaluateCondition(c.not, values, context)
  if (isFieldCondition(c)) return evaluateField(c, values)
  if (isContextCondition(c)) return evaluateContext(c, context)
  return false
}

function collect(c: UntypedCondition, into: Set<string>): void {
  if ('all' in c) for (const child of c.all) collect(child, into)
  else if ('any' in c) for (const child of c.any) collect(child, into)
  else if ('not' in c) collect(c.not, into)
  else if (isFieldCondition(c)) into.add(c.field)
}

/** The value paths a condition reads, de-duplicated in first-seen order (context keys excluded). */
export function conditionDeps(c: UntypedCondition): readonly string[] {
  const into = new Set<string>()
  collect(c, into)
  return [...into]
}

/** True when the condition reads the render `context` anywhere. */
export function usesContext(c: UntypedCondition): boolean {
  if ('all' in c) return c.all.some(usesContext)
  if ('any' in c) return c.any.some(usesContext)
  if ('not' in c) return usesContext(c.not)
  return isContextCondition(c)
}
