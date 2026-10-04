import type { StandardSchemaV1Issue } from '@tanstack/react-form'

type PathSegment = PropertyKey | { readonly key: PropertyKey }

const INDEX = /^\d+$/

/**
 * Formats an issue path the way TanStack names fields: `['guests', 0, 'name']` → `guests[0].name`.
 * Numeric segments (numbers or digit-only strings) become `[n]`.
 */
export function formatPath(path: readonly PathSegment[] | undefined): string {
  if (!path) return ''
  let out = ''
  for (const raw of path) {
    const segment = typeof raw === 'object' ? raw.key : raw
    const text = typeof segment === 'symbol' ? (segment.description ?? '') : String(segment)
    if (typeof segment === 'number' || INDEX.test(text)) out += `[${text}]`
    else out += out === '' ? text : `.${text}`
  }
  return out
}

/** Normalises a dotted path written by hand or a server: `a.0.b` → `a[0].b`. Bracketed paths pass through. */
export function normalisePath(path: string): string {
  if (path === '') return ''
  const segments: string[] = []
  for (const part of path.split('.')) {
    const match = /^([^[]*)((?:\[\d+\])*)$/.exec(part)
    if (!match) {
      segments.push(part)
      continue
    }
    const [, head = '', indexes = ''] = match
    if (head !== '') segments.push(head)
    for (const index of indexes.matchAll(/\[(\d+)\]/g)) segments.push(index[1] ?? '')
  }
  return formatPath(segments)
}

/** The path of a Standard Schema issue in TanStack form. */
export function issuePath(issue: StandardSchemaV1Issue): string {
  return formatPath(issue.path)
}

/** True when `path` is `prefix` itself or nested under it (`a`, `a.b`, `a[0]`). */
export function isAtOrUnder(path: string, prefix: string): boolean {
  if (path === prefix) return true
  return path.startsWith(`${prefix}.`) || path.startsWith(`${prefix}[`)
}
