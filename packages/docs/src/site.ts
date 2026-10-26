import { loader, type StaticSource } from 'fumadocs-core/source'
import type { SiteConfig } from './config.ts'
import { withPageOrder } from './pageOrder.ts'
import { mergeSources, type SourceConfig } from './slugs.ts'

/** Where the docs live. The site's landing page is `/`. */
export const DOCS_BASE_URL = '/docs'

/** A Fumadocs MDX docs collection, as `fumadocs-mdx:collections/server` exports one. */
export interface DocsCollection<Source extends SourceConfig = SourceConfig> {
  toFumadocsSource: () => StaticSource<Source>
}

export interface DocsSiteOptions<
  Config extends SiteConfig,
  Docs extends SourceConfig,
  Generated extends SourceConfig = Docs,
> {
  /** The site's config, from `site.config.ts`. */
  config: Config
  /**
   * The site's collections: `docs`, its hand-written pages, and `generated`, the pages
   * `writeGenerated()` wrote, when it has any. Pass the `fumadocs-mdx:collections/server`
   * module as it is.
   */
  collections: { docs: DocsCollection<Docs>; generated?: DocsCollection<Generated> }
}

/**
 * A docs site: its config and the Fumadocs loader over its pages. The loader is built here, not in
 * the site, so the rules readers depend on can't be broken from site code (ADR 0045): a
 * hand-written page beats a generated page with the same slug, and `getPages()` lists pages in a
 * defined order.
 */
export function createDocsSite<
  const Config extends SiteConfig,
  Docs extends SourceConfig,
  Generated extends SourceConfig = Docs,
>({ config, collections }: DocsSiteOptions<Config, Docs, Generated>) {
  const source = withPageOrder(
    loader({
      baseUrl: DOCS_BASE_URL,
      source: mergeSources<Docs | Generated>(
        collections.docs.toFumadocsSource(),
        collections.generated?.toFumadocsSource(),
      ),
    }),
  )
  return { config, source }
}
