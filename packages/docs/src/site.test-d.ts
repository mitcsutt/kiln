/**
 * Type tests for `createDocsSite`. Checked by `tsc --noEmit` (the package `typecheck`); never
 * executed.
 */
import type { PageData } from 'fumadocs-core/source'
import type { DocsCollectionEntry } from 'fumadocs-mdx/runtime/server'
import type { SiteConfig } from './config.ts'
import { createDocsSite } from './site.ts'

type Frontmatter = PageData & { exports?: string[] }

// fumadocs-mdx types each collection by its name, so `docs` and `generated` differ, and a page's
// data still carries the site's frontmatter fields.
const exportsOf = (
  config: SiteConfig,
  docs: DocsCollectionEntry<'docs', Frontmatter>,
  generated: DocsCollectionEntry<'generated', Frontmatter>,
) => createDocsSite({ config, collections: { docs, generated } }).source.getPages()[0]?.data.exports

expectTypeOf(exportsOf).returns.toEqualTypeOf<string[] | undefined>()
