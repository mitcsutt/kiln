import { defineDocsCollections, defineDocsConfig } from '@mitcsutt/kiln-docs/mdx-config'
import { z } from 'zod'
import { remarkExamples } from './src/mdx/remark-examples'

/**
 * `exports` names the public exports a page documents. The tree test checks that every
 * component, field, layout and hook has a page, and the agent skills (ADR 0011) can find
 * the page that owns an export from it. Kiln's generated pages are still written into
 * `content/docs` (ADR 0029), so it has no `generated` collection yet.
 */
export const { docs } = defineDocsCollections({
  schema: (page) => page.extend({ exports: z.array(z.string()).optional() }),
})

export default defineDocsConfig({
  // `<Examples of>` expands first, so its headings get ids, reach the table of contents and
  // the search index, and land in the processed Markdown.
  remarkPlugins: (plugins) => [remarkExamples, ...plugins],
})
