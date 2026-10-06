import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb'
import type * as PageTree from 'fumadocs-core/page-tree'
import { flattenTree } from 'fumadocs-core/page-tree'
import { nodeText } from './nodeText'

export function containsUrl(node: PageTree.Node, url: string): boolean {
  if (node.type === 'page') return node.url === url
  if (node.type === 'folder') {
    return node.index?.url === url || node.children.some((child) => containsUrl(child, url))
  }
  return false
}

/** The package sections (UI, Forms, Tooling): the top-level folders marked `"root": true`. */
export function sections(tree: PageTree.Root): PageTree.Folder[] {
  return tree.children.filter(
    (node): node is PageTree.Folder => node.type === 'folder' && Boolean(node.root),
  )
}

/** The section a page belongs to, or undefined for a page outside them (the Introduction). */
export function sectionOf(tree: PageTree.Root, url: string): PageTree.Folder | undefined {
  return sections(tree).find((section) => containsUrl(section, url))
}

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
