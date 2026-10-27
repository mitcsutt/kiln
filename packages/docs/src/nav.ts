import type * as PageTree from 'fumadocs-core/page-tree'
import type { ReactNode } from 'react'
import type { SiteConfig } from './config.ts'

/**
 * The sidebar's model: what it lists for the current page, for the chrome to render. It holds
 * data only, so client components can read it. Every page is reachable through it, whether or not
 * the tree has sections: a site whose `meta.json` files mark no folder `"root": true` gets its
 * whole tree, and a folder inside a group is listed as a labelled run, not dropped.
 */

/** A run of links in a group, under the separator or folder that starts it. */
export interface SidebarRun {
  label?: string
  pages: PageTree.Item[]
}

/** A folder shown as one disclosure: its index and pages, in runs. */
export interface SidebarGroup {
  /** Stable across renders, for the disclosure's open state. */
  key: string
  name: string
  folder: PageTree.Folder
  runs: SidebarRun[]
}

/** A section in the overview, linked to its index or, without one, its first page. */
export interface SidebarSection {
  key: string
  name: string
  url: string
  description?: ReactNode
  folder: PageTree.Folder
}

export interface Sidebar {
  /** The section holding the page, when the tree has sections and the page is in one. */
  section?: PageTree.Folder
  /** The name of the first list of links, a navigation landmark of its own. */
  label: string
  /** The links before the groups: a section's index and pages, or the top-level pages. */
  pages: PageTree.Item[]
  /** The folders, each a disclosure. */
  groups: SidebarGroup[]
  /** Outside a section: the tree's sections, under their own landmark name. */
  sections: { label: string; items: SidebarSection[] }
}

/** Page-tree names are typed as ReactNode, but they come from frontmatter and `meta.json`. */
export function nodeText(node: ReactNode): string {
  return typeof node === 'string' || typeof node === 'number' ? String(node) : ''
}

export function nodeKey(node: PageTree.Node): string {
  if (node.type === 'page') return node.url
  if (node.type === 'folder') return node.$id ?? nodeText(node.name)
  return node.$id ?? 'separator'
}

export function containsUrl(node: PageTree.Node, url: string): boolean {
  if (node.type === 'page') return node.url === url
  if (node.type === 'folder') {
    return node.index?.url === url || node.children.some((child) => containsUrl(child, url))
  }
  return false
}

/** The tree's sections: the top-level folders marked `"root": true` (ADR 0033). */
export function sections(tree: PageTree.Root): PageTree.Folder[] {
  return tree.children.filter(
    (node): node is PageTree.Folder => node.type === 'folder' && Boolean(node.root),
  )
}

/** The section a page belongs to, or undefined for a page outside them, or a tree without any. */
export function sectionOf(tree: PageTree.Root, url: string): PageTree.Folder | undefined {
  return sections(tree).find((section) => containsUrl(section, url))
}

const itemsOf = (folder: PageTree.Folder): PageTree.Node[] =>
  folder.index ? [folder.index, ...folder.children] : folder.children

const joined = (outer: string | undefined, inner: string) => (outer ? `${outer} / ${inner}` : inner)

/**
 * A folder's links in runs: split at its `meta.json` separators (`---Fields---`), with each folder
 * inside it a run of its own, named by its path from the group (`Plugins / git`).
 */
function runsOf(folder: PageTree.Folder): SidebarRun[] {
  const runs: SidebarRun[] = []
  const add = (label: string | undefined, page: PageTree.Item) => {
    const last = runs.at(-1)
    if (last && last.label === label) last.pages.push(page)
    else runs.push({ label, pages: [page] })
  }
  const walk = (nodes: PageTree.Node[], path: string | undefined) => {
    let label = path
    for (const node of nodes) {
      if (node.type === 'separator') label = joined(path, nodeText(node.name))
      else if (node.type === 'page') add(label, node)
      else walk(itemsOf(node), joined(path, nodeText(node.name)))
    }
  }
  walk(itemsOf(folder), undefined)
  return runs
}

const groupsOf = (nodes: PageTree.Node[]): SidebarGroup[] =>
  nodes
    .filter((node): node is PageTree.Folder => node.type === 'folder')
    .map((folder) => ({
      key: nodeKey(folder),
      name: nodeText(folder.name),
      folder,
      runs: runsOf(folder),
    }))

const pagesOf = (nodes: PageTree.Node[]) =>
  nodes.filter((node): node is PageTree.Item => node.type === 'page')

/** A folder's first page, its index first: where a link to the folder goes. */
function firstPage(folder: PageTree.Folder): PageTree.Item | undefined {
  for (const node of itemsOf(folder)) {
    if (node.type === 'page') return node
    if (node.type === 'folder') {
      const page = firstPage(node)
      if (page) return page
    }
  }
  return undefined
}

/**
 * What the sidebar lists on the page at `url`. Inside a section, that section alone (ADR 0033):
 * its index and pages, then its folders as groups. Outside one, the top-level pages under
 * `nav.labels.pages`, any top-level folder that isn't a section as a group, and the sections under
 * `nav.labels.sections`. A tree without sections is all "outside", so it lists every page.
 */
export function sidebarOf(
  tree: PageTree.Root,
  url: string,
  config: Pick<SiteConfig, 'name' | 'nav'>,
): Sidebar {
  const labels = config.nav.labels
  const sectionsLabel = labels?.sections ?? 'Sections'
  const section = sectionOf(tree, url)
  if (section) {
    return {
      section,
      label: nodeText(section.name),
      pages: [...(section.index ? [section.index] : []), ...pagesOf(section.children)],
      groups: groupsOf(section.children),
      sections: { label: sectionsLabel, items: [] },
    }
  }
  return {
    label: labels?.pages ?? config.name,
    pages: pagesOf(tree.children),
    groups: groupsOf(tree.children.filter((node) => node.type !== 'folder' || !node.root)),
    sections: {
      label: sectionsLabel,
      items: sections(tree).flatMap((folder) => {
        const page = firstPage(folder)
        if (!page) return []
        return [
          {
            key: nodeKey(folder),
            name: nodeText(folder.name),
            url: page.url,
            description: folder.description,
            folder,
          },
        ]
      }),
    },
  }
}
