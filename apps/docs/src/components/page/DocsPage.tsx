import type * as PageTree from 'fumadocs-core/page-tree'
import type { ReactNode } from 'react'
import { nodeText } from '@/lib/nodeText'
import { crumbsOf, neighboursOf } from '@/lib/pageTree'
import type { DocsPageType } from '@/lib/source'
import { PageFrame } from './PageFrame'

/** Server side of a docs page: works out the breadcrumb, neighbours and markdown link. */
export function DocsPage({
  page,
  tree,
  children,
}: {
  page: DocsPageType
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
      title={page.data.title}
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
