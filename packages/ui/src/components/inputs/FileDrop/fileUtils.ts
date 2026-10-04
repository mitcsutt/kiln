import type { FileValue } from './FileDrop'

/* Pure helpers for FileDrop (internal — not exported from the package). */

export function isFile(value: FileValue): value is File {
  return typeof File !== 'undefined' && value instanceof File
}

/** Whether `file` matches a native `accept` string. An empty/absent accept matches everything. */
export function matchesAccept(
  file: { name: string; type?: string },
  accept: string | undefined,
): boolean {
  if (!accept) return true
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true
  const name = file.name.toLowerCase()
  const type = (file.type ?? '').toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const

/** "840 bytes", "12 kB", "2.4 MB" — decimal units, formatted by Intl. */
export function formatFileSize(bytes: number, locale?: string): string {
  let value = bytes
  let unit = 0
  while (value >= 1000 && unit < SIZE_UNITS.length - 1) {
    value /= 1000
    unit += 1
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: SIZE_UNITS[unit],
    unitDisplay: unit === 0 ? 'long' : 'short',
    maximumFractionDigits: unit === 0 || value >= 10 ? 0 : 1,
  }).format(value)
}

export function isImage(value: FileValue): boolean {
  return (value.type ?? '').startsWith('image/')
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1, dot + 5).toUpperCase() : ''
}
