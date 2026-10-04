/** Pure value helpers shared by conditions, rules, analysis and the Standard Schema adapter. */

/** `guests[0].name` / `guests.0.name` → `['guests', 0, 'name']`. */
export function pathSegments(path: string): (string | number)[] {
  const segments: (string | number)[] = []
  for (const match of path.matchAll(/[^.[\]]+/g)) {
    const part = match[0]
    segments.push(/^\d+$/.test(part) ? Number(part) : part)
  }
  return segments
}

/** Joins a scope prefix and a relative name the way TanStack names fields. */
export function joinPath(prefix: string, name: string): string {
  if (prefix === '') return name
  if (name === '') return prefix
  return name.startsWith('[') ? `${prefix}${name}` : `${prefix}.${name}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Path segments that could reach or replace an object's prototype — never read or written. */
export const UNSAFE_PATH_SEGMENTS: readonly string[] = ['__proto__', 'prototype', 'constructor']

/** The first prototype-reaching segment of a path, if any. */
export function unsafePathSegment(path: string): string | undefined {
  return pathSegments(path).find(
    (segment): segment is string =>
      typeof segment === 'string' && UNSAFE_PATH_SEGMENTS.includes(segment),
  )
}

const own = (node: object, key: string | number) => Object.prototype.hasOwnProperty.call(node, key)

/**
 * Reads a TanStack-style path (`a.b`, `a[0].b`, `a.0.b`). Missing segments → `undefined`. Only own
 * properties are read; `__proto__` / `prototype` / `constructor` segments read `undefined`.
 */
export function getPath(values: unknown, path: string): unknown {
  let node: unknown = values
  for (const segment of pathSegments(path)) {
    if (!isRecord(node) || (typeof segment === 'string' && UNSAFE_PATH_SEGMENTS.includes(segment)))
      return undefined
    if (!own(node, segment)) return undefined
    node = (node as Record<string | number, unknown>)[segment]
  }
  return node
}

/**
 * Writes a path into a plain object, creating objects / arrays on the way. Mutates `target`.
 * Throws on `__proto__` / `prototype` / `constructor` segments (prototype pollution).
 */
export function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const unsafe = unsafePathSegment(path)
  if (unsafe !== undefined)
    throw new Error(
      `[@mitcsutt/kiln-forms] Refusing to write path "${path}": segment "${unsafe}" is not allowed.`,
    )
  const segments = pathSegments(path)
  let node: Record<string | number, unknown> = target
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      node[segment] = value
      return
    }
    const next = own(node, segment) ? node[segment] : undefined
    if (isRecord(next)) {
      node = next
      return
    }
    const created = (typeof segments[index + 1] === 'number' ? [] : {}) as Record<
      string | number,
      unknown
    >
    node[segment] = created
    node = created
  })
}

/** Structural equality for JSON-like values (`Object.is` for primitives, so `NaN` equals `NaN`). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (!isRecord(a) || !isRecord(b)) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))
  }
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]),
  )
}

/** §10.3 `empty`: `''`, `null`, `undefined` or `[]`. */
export function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

/** True for values that survive `JSON.stringify` → `JSON.parse` unchanged. */
export function isJson(value: unknown): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every((item) => isJson(item))
  if (typeof value !== 'object') return false
  const proto: unknown = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) return false
  return Object.values(value).every((item) => isJson(item))
}
