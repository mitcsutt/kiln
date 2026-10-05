import type { StandardSchemaV1Issue } from '@tanstack/react-form'
import { issuePath } from '#utils/paths'

export type { ErrorVisibility } from '#runtime/visibility'

/** Anything a validator may return as an error. */
export type FormError =
  | string
  | true
  | StandardSchemaV1Issue
  | { message: string; code?: string; params?: Record<string, unknown> }
  | Error

export interface NormalisedError {
  message: string
  code?: string
  params?: Record<string, unknown>
  path?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Turns any validator output into `{ message, code?, params?, path? }`: strings, Standard Schema
 * issues, `{ message }` objects and `Error`s. `true` → `{ message: '' }` (invalid, no text).
 * Anything else (falsy, numbers, arrays) → `null`.
 */
export function normaliseError(e: unknown): NormalisedError | null {
  if (e === true) return { message: '' }
  if (typeof e === 'string') return e === '' ? null : { message: e }
  if (e instanceof Error) return { message: e.message }
  if (!isRecord(e) || Array.isArray(e)) return null
  if (typeof e.message !== 'string') return null
  const out: NormalisedError = { message: e.message }
  if (typeof e.code === 'string') out.code = e.code
  if (isRecord(e.params)) out.params = e.params
  if (Array.isArray(e.path)) {
    const path = issuePath({ message: e.message, path: e.path as StandardSchemaV1Issue['path'] })
    if (path !== '') out.path = path
  } else if (typeof e.path === 'string' && e.path !== '') {
    out.path = e.path
  }
  return out
}

/** Flattens nested arrays (TanStack stores issue arrays per slot) and normalises, dropping non-errors. */
export function normaliseErrors(value: unknown): NormalisedError[] {
  if (value === undefined || value === null || value === false) return []
  if (Array.isArray(value)) return value.flatMap((item: unknown) => normaliseErrors(item))
  const normalised = normaliseError(value)
  return normalised ? [normalised] : []
}

/** Error-map slots, highest priority first (§4.2.3). */
export const ERROR_SLOT_PRIORITY = [
  'onServer',
  'onSubmit',
  'onDynamic',
  'onChange',
  'onBlur',
  'onMount',
] as const

/**
 * All errors of an error map in slot priority, normalised and de-duplicated by message.
 * The binding shows only the first (one message per field).
 */
export function pickErrors(
  errorMap: Partial<Record<string, unknown>> | undefined,
): NormalisedError[] {
  if (!errorMap) return []
  const seen = new Set<string>()
  const out: NormalisedError[] = []
  const slots: string[] = [...ERROR_SLOT_PRIORITY]
  for (const key of Object.keys(errorMap)) if (!slots.includes(key)) slots.push(key)
  for (const slot of slots) {
    for (const error of normaliseErrors(errorMap[slot])) {
      if (seen.has(error.message)) continue
      seen.add(error.message)
      out.push(error)
    }
  }
  return out
}

/** The first error of an error map, or `undefined`. */
export function pickError(
  errorMap: Partial<Record<string, unknown>> | undefined,
): NormalisedError | undefined {
  return pickErrors(errorMap)[0]
}
