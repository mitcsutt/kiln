import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb'
import type * as PageTree from 'fumadocs-core/page-tree'
import { flattenTree } from 'fumadocs-core/page-tree'
import { nodeText, sectionOf } from './nav.ts'

/**
 * The page's crumbs, starting with its section. Fumadocs' `includeRoot` names the crumb after
 * the whole tree rather than the section, so the section is added here.
 */
export function crumbsOf(tree: PageTree.Root, url: string): string[] {
  const section = sectionOf(tree, url)
  return [
    ...(section ? [nodeText(section.name)] : []),
    ...getBreadcrumbItems(url, tree, { includeRoot: false }).map((item) => nodeText(item.name)),
  ].filter(Boolean)
}

/**
 * The previous and next pages, within the page's section. Fumadocs' `findNeighbour` leaves a
 * section's own index out of the section, so from that index the pager would cross packages.
 */
export function neighboursOf(
  tree: PageTree.Root,
  url: string,
): { previous?: PageTree.Item; next?: PageTree.Item } {
  const section = sectionOf(tree, url)
  const list = flattenTree(section ? [section] : tree.children)
  const index = list.findIndex((item) => item.url === url)
  if (index === -1) return {}
  return { previous: list[index - 1], next: list[index + 1] }
}
