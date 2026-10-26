import { createMarkdown } from './markdown'
import { source } from './source'
import { toMarkdown } from './to-markdown'

/**
 * Kiln's Markdown routes. The `markdown.transform` hook is `toMarkdown`, which turns each page's
 * variant blocks, decision pairs, live examples, API and token tables and callouts into plain
 * Markdown, read from the same data the page renders.
 */
export const markdown = createMarkdown({
  source,
  transform: (processed) => toMarkdown(processed),
})
