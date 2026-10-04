import type { AnyFormApi, StandardSchemaV1, StandardSchemaV1Issue } from '@tanstack/react-form'
import { getFormRuntime, isInactive, type FormRuntime } from '#core/runtime/formRuntime'
import { issuePath } from '#core/runtime/paths'

/** Issues routed to TanStack's form-validator shape: path-less → `form`, the rest by field path. */
export interface RoutedIssues {
  form?: StandardSchemaV1Issue[]
  fields: Record<string, StandardSchemaV1Issue[]>
}

/**
 * Routes issues by path (`['guests', 0, 'name']` → `guests[0].name`) and drops issues whose path
 * is inactive or under an inactive prefix (§5.3). Returns `undefined` when nothing is left — an
 * empty object would count as "errored" in TanStack.
 */
export function routeIssues(
  issues: readonly StandardSchemaV1Issue[] | undefined,
  runtime?: FormRuntime,
): RoutedIssues | undefined {
  if (!issues || issues.length === 0) return undefined
  const form: StandardSchemaV1Issue[] = []
  const fields: Record<string, StandardSchemaV1Issue[]> = {}
  let count = 0
  for (const issue of issues) {
    const path = issuePath(issue)
    if (path === '') {
      form.push(issue)
      count += 1
      continue
    }
    if (runtime && isInactive(runtime, path)) continue
    ;(fields[path] ??= []).push(issue)
    count += 1
  }
  if (count === 0) return undefined
  return form.length > 0 ? { form, fields } : { fields }
}

const ASYNC_IN_SYNC =
  '[@mitcsutt/kiln-forms] This schema validates asynchronously. Pass `schemaAsync: true` to useAppForm so it runs in the async slot.'

/** A TanStack form validator (sync slot) for a whole-form Standard Schema. */
export function schemaValidator(schema: StandardSchemaV1) {
  return ({
    value,
    formApi,
  }: {
    value: unknown
    formApi: AnyFormApi
  }): RoutedIssues | undefined => {
    const result = schema['~standard'].validate(value)
    if (result instanceof Promise) throw new Error(ASYNC_IN_SYNC)
    return routeIssues(result.issues, getFormRuntime(formApi))
  }
}

/** A TanStack form validator (async slot) for a whole-form Standard Schema. */
export function schemaValidatorAsync(schema: StandardSchemaV1) {
  return async ({
    value,
    formApi,
  }: {
    value: unknown
    formApi: AnyFormApi
  }): Promise<RoutedIssues | undefined> => {
    const result = await schema['~standard'].validate(value)
    return routeIssues(result.issues, getFormRuntime(formApi))
  }
}

/** True for any Standard Schema object (zod 4, valibot, arktype…). */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return typeof value === 'object' && value !== null && '~standard' in value
}
