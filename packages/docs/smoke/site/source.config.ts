import { defineDocsCollections, defineDocsConfig } from '@mitcsutt/kiln-docs/mdx-config'
import { z } from 'zod'

// `plugin` is the site's own frontmatter field: without the schema hook, it'd be stripped.
export const { docs, generated } = defineDocsCollections({
  schema: (page) => page.extend({ plugin: z.string().optional() }),
})

export default defineDocsConfig()
