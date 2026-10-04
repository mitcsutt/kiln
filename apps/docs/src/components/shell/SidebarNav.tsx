'use client'

import { Accordion, NavLinks, Stack, Text } from '@mitcsutt/kiln-ui'
import type * as PageTree from 'fumadocs-core/page-tree'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { nodeText } from '@/lib/nodeText'
import styles from './SidebarNav.module.css'

function nodeKey(node: PageTree.Node): string {
  if (node.type === 'page') return node.url
  if (node.type === 'folder') return node.$id ?? nodeText(node.name)
  return node.$id ?? 'separator'
}

function containsUrl(node: PageTree.Node, url: string): boolean {
  if (node.type === 'page') return node.url === url
  if (node.type === 'folder') {
    return node.index?.url === url || node.children.some((child) => containsUrl(child, url))
  }
  return false
}

interface PageLinksProps {
  nodes: PageTree.Node[]
  pathname: string
  /** Each list is its own navigation landmark, so each needs its own name. */
  label: string
}

function PageLinks({ nodes, pathname, label }: PageLinksProps) {
  const pages = nodes.filter((node): node is PageTree.Item => node.type === 'page')
  return (
    <NavLinks orientation="vertical" size="sm" label={label} className={styles.links}>
      {pages.map((page) => (
        <NavLinks.Item key={page.url} asChild active={page.url === pathname}>
          <NextLink href={page.url}>{page.name}</NextLink>
        </NavLinks.Item>
      ))}
    </NavLinks>
  )
}

/** Splits a folder's items at its meta.json separators (`---Fields---`) into labelled runs. */
function runs(nodes: PageTree.Node[]): { label?: string; nodes: PageTree.Node[] }[] {
  const result: { label?: string; nodes: PageTree.Node[] }[] = [{ nodes: [] }]
  for (const node of nodes) {
    if (node.type === 'separator') result.push({ label: nodeText(node.name), nodes: [] })
    else result.at(-1)?.nodes.push(node)
  }
  return result.filter((run) => run.nodes.length)
}

/** A second-level folder (UI/Inputs, Forms/Fields): one disclosure, open while it holds the current page. */
function Group({
  folder,
  pathname,
  section,
}: {
  folder: PageTree.Folder
  pathname: string
  section: string
}) {
  const items: PageTree.Node[] = folder.index ? [folder.index, ...folder.children] : folder.children
  const name = `${section}: ${nodeText(folder.name)}`
  return (
    <Accordion.Item value={nodeKey(folder)}>
      <Accordion.Trigger className={styles.groupTrigger}>{folder.name}</Accordion.Trigger>
      <Accordion.Content>
        {runs(items).map((run) => (
          <div key={run.label ?? 'pages'}>
            {run.label ? (
              <Text as="p" size="xs" tone="muted" className={styles.runLabel}>
                {run.label}
              </Text>
            ) : null}
            <PageLinks
              nodes={run.nodes}
              pathname={pathname}
              label={run.label ? `${name}, ${run.label}` : name}
            />
          </div>
        ))}
      </Accordion.Content>
    </Accordion.Item>
  )
}

/** A top-level folder (UI, Forms, Tooling): a label, its own pages, then its groups. */
function Section({ folder, pathname }: { folder: PageTree.Folder; pathname: string }) {
  const pages: PageTree.Node[] = [
    ...(folder.index ? [folder.index] : []),
    ...folder.children.filter((child) => child.type === 'page'),
  ]
  const groups = folder.children.filter(
    (child): child is PageTree.Folder => child.type === 'folder',
  )
  const open = groups.filter((group) => containsUrl(group, pathname)).map(nodeKey)
  return (
    <Stack gap={2}>
      <Text as="p" size="sm" weight="strong" className={styles.sectionLabel}>
        {folder.name}
      </Text>
      {pages.length ? (
        <PageLinks nodes={pages} pathname={pathname} label={nodeText(folder.name)} />
      ) : null}
      {groups.length ? (
        // Keyed by the current page so moving to another group opens it.
        <Accordion key={pathname} type="multiple" defaultValue={open} className={styles.groups}>
          {groups.map((group) => (
            <Group
              key={nodeKey(group)}
              folder={group}
              pathname={pathname}
              section={nodeText(folder.name)}
            />
          ))}
        </Accordion>
      ) : null}
    </Stack>
  )
}

export function SidebarNav({ tree }: { tree: PageTree.Root }) {
  const pathname = usePathname()
  const topPages = tree.children.filter((node) => node.type === 'page')
  const sections = tree.children.filter((node): node is PageTree.Folder => node.type === 'folder')
  return (
    <div className={styles.nav}>
      <Stack gap={6}>
        {topPages.length ? <PageLinks nodes={topPages} pathname={pathname} label="Kiln" /> : null}
        {sections.map((section) => (
          <Section key={nodeKey(section)} folder={section} pathname={pathname} />
        ))}
      </Stack>
    </div>
  )
}
