'use client'

import { Accordion, Link, NavLinks, Stack, Text } from '@mitcsutt/kiln-ui'
import type * as PageTree from 'fumadocs-core/page-tree'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { containsUrl, nodeKey, sidebarOf, type Sidebar, type SidebarGroup } from '../../nav.ts'
import { useSiteConfig } from '../SiteConfig.tsx'
import styles from './SidebarNav.module.css'

interface PageLinksProps {
  pages: PageTree.Item[]
  pathname: string
  /** Each list is its own navigation landmark, so each needs its own name. */
  label: string
}

function PageLinks({ pages, pathname, label }: PageLinksProps) {
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

/**
 * A folder (UI/Inputs, Forms/Fields): one disclosure, open while it holds the current page. Its
 * heading is the Accordion's own trigger. The chrome doesn't restyle it: two rules of one
 * specificity from different modules resolve by the order the bundler's CSS chunks load in, which
 * moves whenever the module graph does.
 */
function Group({ group, pathname, name }: { group: SidebarGroup; pathname: string; name: string }) {
  return (
    <Accordion.Item value={group.key}>
      <Accordion.Trigger>{group.folder.name}</Accordion.Trigger>
      <Accordion.Content>
        {group.runs.map((run) => (
          <div key={run.label ?? 'pages'}>
            {run.label ? (
              <Text as="p" size="xs" tone="muted" className={styles.runLabel}>
                {run.label}
              </Text>
            ) : null}
            <PageLinks
              pages={run.pages}
              pathname={pathname}
              label={run.label ? `${name}, ${run.label}` : name}
            />
          </div>
        ))}
      </Accordion.Content>
    </Accordion.Item>
  )
}

function openGroups(groups: SidebarGroup[], pathname: string): string[] {
  return groups.filter((group) => containsUrl(group.folder, pathname)).map((group) => group.key)
}

/**
 * The sidebar's folders as disclosures. Moving to a page opens its group and leaves the others as
 * they were, so the sidebar keeps its height and scroll position across navigations.
 */
function Groups({ sidebar, pathname }: { sidebar: Sidebar; pathname: string }) {
  const { groups } = sidebar
  const [open, setOpen] = useState(() => openGroups(groups, pathname))
  const [openedFor, setOpenedFor] = useState(pathname)
  if (pathname !== openedFor) {
    setOpenedFor(pathname)
    const current = openGroups(groups, pathname).filter((key) => !open.includes(key))
    if (current.length) setOpen([...open, ...current])
  }
  if (!groups.length) return null
  return (
    <Accordion type="multiple" value={open} onValueChange={setOpen} className={styles.groups}>
      {groups.map((group) => (
        <Group
          key={group.key}
          group={group}
          pathname={pathname}
          name={`${sidebar.label}: ${group.name}`}
        />
      ))}
    </Accordion>
  )
}

/** A section (UI, Forms, Tooling): its own pages, then its groups. The topbar names it. */
function Section({ sidebar, pathname }: { sidebar: Sidebar; pathname: string }) {
  return (
    <Stack gap={2}>
      {sidebar.pages.length ? (
        <PageLinks pages={sidebar.pages} pathname={pathname} label={sidebar.label} />
      ) : null}
      <Groups sidebar={sidebar} pathname={pathname} />
    </Stack>
  )
}

/**
 * Outside a section (the Introduction): the top-level pages, any folder that isn't a section,
 * then each section with its `meta.json` description.
 */
function Overview({ sidebar, pathname }: { sidebar: Sidebar; pathname: string }) {
  const { sections } = sidebar
  return (
    <Stack gap={6}>
      {sidebar.pages.length ? (
        <PageLinks pages={sidebar.pages} pathname={pathname} label={sidebar.label} />
      ) : null}
      <Groups sidebar={sidebar} pathname={pathname} />
      {sections.items.length ? (
        <nav aria-label={sections.label}>
          <Stack as="ul" gap={4} role="list" className={styles.sectionList}>
            {sections.items.map((section) => (
              <li key={section.key}>
                <Stack gap={1}>
                  <Text as="p" size="md" weight="strong" className={styles.sectionLabel}>
                    <Link asChild underline="hover">
                      <NextLink href={section.url}>{section.folder.name}</NextLink>
                    </Link>
                  </Text>
                  {section.description ? (
                    <Text as="p" size="sm" tone="muted">
                      {section.description}
                    </Text>
                  ) : null}
                </Stack>
              </li>
            ))}
          </Stack>
        </nav>
      ) : null}
    </Stack>
  )
}

/** The nearest ancestor that scrolls vertically: the sidebar, or the phone sheet. */
function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) return node
  }
  return null
}

/**
 * The sidebar, from the nav model (`sidebarOf`): inside a section, that section alone (ADR 0033);
 * outside one, the top-level pages, the other folders and the sections. A tree without sections
 * is all "outside", so every page is reachable.
 */
export function SidebarNav({ tree }: { tree: PageTree.Root }) {
  const config = useSiteConfig()
  const pathname = usePathname()
  const sidebar = sidebarOf(tree, pathname, config)
  const ref = useRef<HTMLDivElement>(null)
  // Bring the current page's link into view when it's out of sight: on a fresh load of a page
  // far down the tree, or after a search result or in-page link opens another group.
  useEffect(() => {
    const link = ref.current?.querySelector<HTMLElement>('[aria-current="page"]')
    const scroller = link && scrollParent(link)
    if (!link || !scroller) return
    const box = scroller.getBoundingClientRect()
    const { top, bottom, height } = link.getBoundingClientRect()
    if (top >= box.top && bottom <= box.bottom) return
    scroller.scrollTop += top - box.top - (box.height - height) / 2
  }, [pathname])
  return (
    <div ref={ref} className={styles.nav}>
      {sidebar.section ? (
        // Keyed by section, so moving to another package starts from that package's groups.
        <Section key={nodeKey(sidebar.section)} sidebar={sidebar} pathname={pathname} />
      ) : (
        <Overview sidebar={sidebar} pathname={pathname} />
      )}
    </div>
  )
}
