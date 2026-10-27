import type * as PageTree from 'fumadocs-core/page-tree'
import type { TOCItemType } from 'fumadocs-core/toc'
import type { MDXComponents } from 'mdx/types'
// The bare specifier, which Next.js resolves to its server build in server components. This
// entry is compiled by the site's bundler, never loaded by plain Node.
import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import { defaultComponents } from '../components/mdx/defaults.tsx'
import { DocsPage as PageBody } from '../components/page/DocsPage.tsx'
import type { PageProps } from '../site.ts'

/** What a page renders: its MDX and its table of contents, as fumadocs-mdx gives them. */
interface RenderedPage {
  url: string
  path: string
  data: {
    title?: string
    description?: string
    body?: ComponentType<{ components?: MDXComponents }>
    toc?: TOCItemType[]
  }
}

export interface DocsPageSite {
  source: {
    getPageTree: () => PageTree.Root
    getPage: (slug?: string[]) => RenderedPage | undefined
  }
}

export interface DocsPageOptions {
  /** The site's own MDX components, over the defaults (`pre`, `a` and `Variant`). */
  components?: MDXComponents
}

/**
 * `app/docs/[[...slug]]/page.tsx`: `export default createDocsPage(site)`. A docs page: its MDX in
 * the page frame, with the breadcrumb, the table of contents and the pager. A site's own MDX
 * components go in `components`, imported by this route file alone, so their CSS loads with the
 * page.
 */
export function createDocsPage({ source }: DocsPageSite, { components }: DocsPageOptions = {}) {
  const mdxComponents: MDXComponents = { ...defaultComponents, ...components }
  return async function DocsPage({ params }: PageProps) {
    const { slug } = await params
    const page = source.getPage(slug)
    if (!page) notFound()
    const { body: Mdx, toc } = page.data
    if (!Mdx || !toc) {
      throw new Error(
        `kiln-docs: ${page.path} has no MDX body. Define its collection with defineDocsCollections.`,
      )
    }
    return (
      <PageBody page={{ url: page.url, data: { ...page.data, toc } }} tree={source.getPageTree()}>
        <Mdx components={mdxComponents} />
      </PageBody>
    )
  }
}
