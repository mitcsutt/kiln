/** The hast nodes this plugin reads: `raw` holds the HTML a `.md` page wrote as it is. */
interface Node {
  type: string
  value?: string
  children?: Node[]
}

const COMMENT = /<!--[\s\S]*?(?:-->|$)/g

function convert(parent: Node) {
  if (!parent.children) return
  parent.children = parent.children.flatMap((child): Node[] => {
    if (child.type === 'comment') return []
    if (child.type === 'raw') {
      const value = (child.value ?? '').replace(COMMENT, '')
      return value.trim() ? [{ ...child, type: 'text', value }] : []
    }
    convert(child)
    return [child]
  })
}

/**
 * Shows the raw HTML in a `.md` page as text, and drops HTML comments (ADR 0045). A `.md` page is
 * CommonMark with no JSX, so a page that says `<name>` means the placeholder, not an element: it
 * now shows `<name>` with no backslash. Left alone, MDX drops raw HTML from `.md` without an error,
 * text and all. It runs at the hast stage, so the processed Markdown that `/docs/<page>.md` serves
 * keeps `<name>` as written. `.mdx` has no raw HTML, so it's unaffected.
 */
export function rehypeRawAsText() {
  return (tree: Node) => {
    convert(tree)
  }
}
