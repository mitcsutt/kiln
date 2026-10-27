import type * as PageTree from 'fumadocs-core/page-tree'
import type { TOCItemType } from 'fumadocs-core/toc'
import type { ReactNode } from 'react'
import { nodeText } from '../../nav.ts'
import { crumbsOf, neighboursOf } from '../../pageTree.ts'
import { PageFrame } from './PageFrame.tsx'

/** What a docs page renders from: a page as the loader gives it. */
export interface DocsPageData {
  url: string
  data: { title?: string; description?: string; toc: TOCItemType[] }
}

/** Server side of a docs page: works out the breadcrumb, neighbours and markdown link. */
export function DocsPage({
  page,
  tree,
  children,
}: {
  page: DocsPageData
  tree: PageTree.Root
  children: ReactNode
}) {
  const crumbs = crumbsOf(tree, page.url)
  const { previous, next } = neighboursOf(tree, page.url)
  const toc = page.data.toc
    .filter((item) => item.depth <= 3)
    .map((item) => ({ url: item.url, depth: item.depth, title: item.title }))
  return (
    <PageFrame
      title={page.data.title ?? ''}
      description={page.data.description}
      crumbs={crumbs}
      markdownUrl={`${page.url}.md`}
      toc={toc}
      previous={previous ? { url: previous.url, name: nodeText(previous.name) } : undefined}
      next={next ? { url: next.url, name: nodeText(next.name) } : undefined}
    >
      {children}
    </PageFrame>
  )
}
