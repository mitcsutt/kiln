export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
/** Categorical colour slot → `--color-cat-N`. */
export type AvatarColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** Up to two initials: first + last word ("Ada Okafor" → "AO"), or one for a single name. */
export function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/[\s-]+/u)
    .filter(Boolean)
  if (words.length === 0) return ''
  const first = Array.from(words[0] ?? '')[0] ?? ''
  const last = words.length > 1 ? (Array.from(words[words.length - 1] ?? '')[0] ?? '') : ''
  return (first + last).toLocaleUpperCase()
}

/**
 * Deterministic categorical colour for a name (FNV-1a + finaliser, case- and space-insensitive),
 * so the same person gets the same colour on every screen and every render.
 */
export function avatarColor(name: string): AvatarColor {
  const key = name.trim().toLocaleLowerCase()
  let hash = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  // FNV's low bits barely mix, and `% 8` reads only those: 8 names landed on 3 colours.
  // A murmur3-style finaliser spreads the high bits down first.
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  return (((hash >>> 0) % 8) + 1) as AvatarColor
}
