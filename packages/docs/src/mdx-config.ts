import { pageSchema } from 'fumadocs-core/source/schema'
import {
  defineConfig,
  defineDocs,
  type DefaultMDXOptions,
  type GlobalConfig,
} from 'fumadocs-mdx/config'
import type { z } from 'zod'
import { DEFAULT_CONTENT_DIR, DEFAULT_GENERATED_DIR } from './config.ts'
import { rehypeRawAsText } from './mdx/rehypeRawAsText.ts'
import { remarkCodeTitle } from './mdx/remarkCodeTitle.ts'

export { rehypeRawAsText, remarkCodeTitle }

/** The frontmatter every page has: `title`, and optionally `description` and `icon`. */
export type PageSchema = typeof pageSchema

export interface DocsCollectionsOptions<Schema extends z.ZodType<z.output<PageSchema>>> {
  /**
   * Extends the frontmatter schema with the site's own fields: `(page) => page.extend({ … })`. A
   * field the schema doesn't declare is stripped from the page's data (ADR 0046).
   */
  schema?: (page: PageSchema) => Schema
  /** Where the hand-written pages are, from the site's root. */
  contentDir?: string
  /** Where `writeGenerated()` writes the generated pages, from the site's root. */
  generatedDir?: string
}

/**
 * A site's two collections, for its `source.config.ts` to export as they are:
 * `export const { docs, generated } = defineDocsCollections({ … })`. `docs` holds the hand-written
 * pages and `generated` the pages `writeGenerated()` wrote. Both share the frontmatter schema, and
 * both keep each page's processed Markdown, which the Markdown routes serve.
 */
export function defineDocsCollections<Schema extends z.ZodType<z.output<PageSchema>> = PageSchema>({
  schema,
  contentDir = DEFAULT_CONTENT_DIR,
  generatedDir = DEFAULT_GENERATED_DIR,
}: DocsCollectionsOptions<Schema> = {}) {
  const docs = {
    schema: (schema ? schema(pageSchema) : pageSchema) as Schema,
    postprocess: { includeProcessedMarkdown: { headingIds: false } },
  }
  return {
    docs: defineDocs({ dir: contentDir, docs }),
    generated: defineDocs({ dir: generatedDir, docs }),
  }
}

/**
 * A site's MDX config, for its `source.config.ts` to export as the default. Fumadocs' preset, with:
 *
 * - raw HTML in `.md` shown as text and comments dropped, before any other hast step
 *   (`rehypeRawAsText`);
 * - a fence's title kept for its code block, after the site's own remark steps
 *   (`remarkCodeTitle`): ```` ```tsx title="app/layout.tsx" ````;
 * - Fumadocs' own Shiki pass off, because code is highlighted by kiln-ui's `CodeBlock` (ADR 0035).
 *
 * `options` are Fumadocs' MDX options, and its `remarkPlugins` and `rehypePlugins` work as Fumadocs
 * documents them.
 */
export function defineDocsConfig(options: DefaultMDXOptions = {}): GlobalConfig {
  const { remarkPlugins, rehypePlugins } = options
  return defineConfig({
    mdxOptions: {
      rehypeCodeOptions: false,
      ...options,
      remarkPlugins:
        typeof remarkPlugins === 'function'
          ? (plugins) => [...remarkPlugins(plugins), remarkCodeTitle]
          : [...(remarkPlugins ?? []), remarkCodeTitle],
      rehypePlugins:
        typeof rehypePlugins === 'function'
          ? (plugins) => [rehypeRawAsText, ...rehypePlugins(plugins)]
          : [rehypeRawAsText, ...(rehypePlugins ?? [])],
    },
  })
}
