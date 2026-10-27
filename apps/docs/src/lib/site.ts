import { createDocsSite } from '@mitcsutt/kiln-docs'
import { docs } from 'fumadocs-mdx:collections/server'
import config from '../../site.config'
import { toMarkdown } from './to-markdown'

/**
 * Kiln's docs site, which its route files use. Its Markdown runs `toMarkdown`, which turns each
 * page's variant blocks, decision pairs, live examples, API and token tables and callouts into
 * plain Markdown, read from the same data the page renders. Kiln's MDX components are given to
 * the docs page route (`app/docs/[[...slug]]/page.tsx`), not here.
 */
export const site = createDocsSite({
  config,
  collections: { docs },
  markdown: { transform: (processed) => toMarkdown(processed) },
})
