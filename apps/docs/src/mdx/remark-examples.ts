import type { Root } from 'mdast'
import { SKIP, visit } from 'unist-util-visit'
import { examplesMarkdown } from '../lib/examples'

/** The parts of an MDX JSX element (`mdast-util-mdx-jsx`) this plugin reads. */
interface JsxElement {
  type: string
  name?: string | null
  attributes?: { type: string; name?: string; value?: unknown }[]
}

/**
 * Expands `<Examples of="Button" />` into the docs stories it stands for (`examplesMarkdown`): a
 * heading, the caption as Markdown, and an `<Example of name />` each. It runs before Fumadocs'
 * own plugins (`source.config.ts`), so the headings get ids and reach the table of contents and
 * the search index, and the processed Markdown (`/docs/<page>.md`) holds the expanded page.
 */
export function remarkExamples(this: unknown) {
  // The processor this plugin is attached to parses the expansion like the rest of the page.
  const processor = this as { parse: (markdown: string) => Root }
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      const element = node as JsxElement
      if (element.type !== 'mdxJsxFlowElement' || element.name !== 'Examples') return
      if (!parent || index === undefined) return
      const of = element.attributes?.find(
        (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'of',
      )?.value
      if (typeof of !== 'string') throw new Error('<Examples /> needs `of`, a string.')
      const { children } = processor.parse(examplesMarkdown(of))
      parent.children.splice(index, 1, ...children)
      return [SKIP, index + children.length]
    })
  }
}
