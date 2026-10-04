import { pageSchema } from 'fumadocs-core/source/schema'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import { z } from 'zod'
import { remarkCodeTitle } from './src/mdx/remark-code-title'

/**
 * `exports` names the public exports a page documents. The tree test checks that every
 * component, field, layout and hook has a page, and the agent skills (ADR 0011) can find
 * the page that owns an export from it.
 */
const docsPageSchema = pageSchema.extend({
  exports: z.array(z.string()).optional(),
})

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: docsPageSchema,
    // The processed Markdown is what `/docs/<page>.md` and `llms-full.txt` serve.
    postprocess: { includeProcessedMarkdown: { headingIds: false } },
  },
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [...plugins, remarkCodeTitle],
    // Code renders through kiln-ui's CodeBlock, which is unhighlighted by design.
    rehypeCodeOptions: false,
  },
})
