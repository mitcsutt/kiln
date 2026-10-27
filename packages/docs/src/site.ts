import { loader, type StaticSource } from 'fumadocs-core/source'
import type { Metadata, MetadataRoute } from 'next'
// The bare specifier, which Next.js resolves to its server build in route handlers and server
// components. The root entry is compiled by the site's bundler, never loaded by plain Node.
import { notFound } from 'next/navigation'
import type { SiteConfig } from './config.ts'
import { createMarkdown, type MarkdownTransform } from './markdown.ts'
import { withPageOrder } from './pageOrder.ts'
import { createSearchRoute, type SearchRoute } from './search.ts'
import { pageMetadata, rootMetadata, robots, sitemap } from './seo.ts'
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
  /** The site's own steps for its pages' Markdown (`MarkdownTransform`). */
  markdown?: { transform?: MarkdownTransform }
}

/** A docs page's route params: `app/docs/[[...slug]]/page.tsx`. */
export interface PageProps {
  params: Promise<{ slug?: string[] }>
}

const MARKDOWN_HEADERS = { 'Content-Type': 'text/markdown; charset=utf-8' }

/** The docs index's Markdown, as a file name no page slug can take (an `index.mdx` has none). */
const MARKDOWN_INDEX = 'index.md'

/**
 * A docs site: its config, the Fumadocs loader over its pages, and what its route files re-export.
 * The loader is built here, not in the site, so the rules readers depend on can't be broken from
 * site code (ADR 0045): a hand-written page beats a generated page with the same slug, and
 * `getPages()` lists pages in a defined order.
 *
 * It holds no React: the route handlers re-export `routes`, and the layouts and pages come from
 * their own entries (`createRootLayout(site)` from `@mitcsutt/kiln-docs/layout`, and so on), so
 * each route segment imports only its own UI and its CSS. Each route handler holds
 * `export const dynamic = 'force-static'` itself, because Next.js ignores re-exported segment
 * config.
 */
export function createDocsSite<
  const Config extends SiteConfig,
  Docs extends SourceConfig,
  Generated extends SourceConfig = Docs,
>({ config, collections, markdown: options }: DocsSiteOptions<Config, Docs, Generated>) {
  const source = withPageOrder(
    loader({
      baseUrl: DOCS_BASE_URL,
      source: mergeSources<Docs | Generated>(
        collections.docs.toFumadocsSource(),
        collections.generated?.toFumadocsSource(),
      ),
    }),
  )
  const markdown = createMarkdown({ config, source, transform: options?.transform })

  /** `app/llms.txt/route.ts` */
  const llmsTxt = {
    GET: () => new Response(markdown.llmsIndex(), { headers: MARKDOWN_HEADERS }),
  }

  /** `app/llms-full.txt/route.ts` */
  const llmsFullTxt = {
    GET: async () => new Response(await markdown.llmsFull(), { headers: MARKDOWN_HEADERS }),
  }

  /**
   * `app/llms.mdx/[...slug]/route.ts`: each page's Markdown at `/llms.mdx/<page>.md`, and the
   * index's at `/llms.mdx/index.md`. The `.md` keeps a page's file apart from the folder its
   * children are written to in the static export. `kiln-docs postbuild` moves them to
   * `/docs/<page>.md` and `/docs.md`, and `next dev` rewrites to them.
   */
  const pageMarkdown = {
    GET: async (_request: Request, { params }: { params: Promise<{ slug: string[] }> }) => {
      const { slug } = await params
      const last = slug.at(-1)
      if (!last?.endsWith('.md')) notFound()
      const page = source.getPage(
        slug.length === 1 && last === MARKDOWN_INDEX
          ? []
          : [...slug.slice(0, -1), last.slice(0, -'.md'.length)],
      )
      if (!page) notFound()
      return new Response(await markdown.page(page), { headers: MARKDOWN_HEADERS })
    },
    generateStaticParams: () =>
      source.getPages().map((page) => ({
        slug: page.slugs.length
          ? [...page.slugs.slice(0, -1), `${String(page.slugs.at(-1))}.md`]
          : [MARKDOWN_INDEX],
      })),
  }

  /** `app/docs/[[...slug]]/page.tsx`: a docs page's metadata. */
  async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const page = source.getPage(slug)
    if (!page) notFound()
    return pageMetadata(config, page)
  }

  return {
    config,
    source,
    markdown,
    /** `app/layout.tsx`: the metadata every page starts from. */
    metadata: rootMetadata(config),
    /** `app/docs/[[...slug]]/page.tsx`: every docs page, for the static export. */
    generateStaticParams: () => source.generateParams(),
    generateMetadata,
    routes: {
      /** `app/api/search/route.ts` */
      search: createSearchRoute(source, config.search.provider) satisfies SearchRoute,
      llmsTxt,
      llmsFullTxt,
      pageMarkdown,
      /** `app/sitemap.ts` */
      sitemap: (): MetadataRoute.Sitemap => sitemap(config, source.getPages()),
      /** `app/robots.ts` */
      robots: (): MetadataRoute.Robots => robots(config),
    },
  }
}
