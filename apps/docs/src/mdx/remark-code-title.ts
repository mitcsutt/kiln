import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Keeps a fence's title for the code block: ```tsx title="app/layout.tsx" puts
 * `data-title` on the `<code>` element, where the MDX `pre` component reads it.
 */
export function remarkCodeTitle() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      const title = node.meta ? /title="([^"]+)"/.exec(node.meta)?.[1] : undefined
      if (!title) return
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, 'data-title': title } }
    })
  }
}
