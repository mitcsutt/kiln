import type { ReactNode } from 'react'

/** Page-tree names are typed as ReactNode, but ours come from frontmatter and meta.json. */
export function nodeText(node: ReactNode): string {
  return typeof node === 'string' || typeof node === 'number' ? String(node) : ''
}
