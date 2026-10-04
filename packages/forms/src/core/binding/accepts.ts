/**
 * Runtime value guards for `useFieldBinding({ accepts })` — the dev-only check for the canonical
 * `field.X` path, where TypeScript cannot see the bound value type. Every guard also accepts
 * `null` / `undefined` (an exact contract allows an optional or nullable field).
 */
const nullish = (value: unknown): value is null | undefined => value === null || value === undefined
const isPrimitive = (value: unknown): boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'

function isFileValue(value: unknown): boolean {
  if (typeof File !== 'undefined' && value instanceof File) return true
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { name?: unknown }).name === 'string'
  )
}

export const accepts = {
  string: (value: unknown): boolean => nullish(value) || typeof value === 'string',
  numberOrNull: (value: unknown): boolean =>
    nullish(value) || (typeof value === 'number' && !Number.isNaN(value)),
  boolean: (value: unknown): boolean => nullish(value) || typeof value === 'boolean',
  primitiveOrNull: (value: unknown): boolean => nullish(value) || isPrimitive(value),
  arrayOfPrimitive: (value: unknown): boolean =>
    nullish(value) || (Array.isArray(value) && value.every(isPrimitive)),
  stringArray: (value: unknown): boolean =>
    nullish(value) || (Array.isArray(value) && value.every((item) => typeof item === 'string')),
  files: (value: unknown): boolean =>
    nullish(value) || (Array.isArray(value) && value.every(isFileValue)),
  tuple2: (value: unknown): boolean =>
    nullish(value) ||
    (Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === 'number')),
  dateRange: (value: unknown): boolean =>
    nullish(value) ||
    (typeof value === 'object' &&
      typeof (value as { start?: unknown }).start === 'string' &&
      typeof (value as { end?: unknown }).end === 'string'),
} as const
