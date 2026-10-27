'use client'

import {
  AppShell,
  Container,
  IconButton,
  Inline,
  MenuIcon,
  NavLinks,
  Sheet,
  Text,
} from '@mitcsutt/kiln-ui'
import type * as PageTree from 'fumadocs-core/page-tree'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { useSiteConfig } from '../SiteConfig.tsx'
import { Search } from './Search.tsx'
import { SidebarNav } from './SidebarNav.tsx'
import { ThemeSwitcher } from './ThemeSwitcher.tsx'
import { Wordmark } from './Wordmark.tsx'
import styles from './DocsShell.module.css'

/** The section switcher: in the topbar from `md`, and at the top of the phone sheet. */
function SectionLinks({ hideBelow }: { hideBelow?: 'md' }) {
  const site = useSiteConfig()
  const pathname = usePathname()
  return (
    <NavLinks label="Sections" size="sm" hideBelow={hideBelow}>
      {site.nav.sections.map((section) => (
        <NavLinks.Item key={section.href} asChild active={pathname.startsWith(section.href)}>
          <NextLink href={section.href}>{section.label}</NextLink>
        </NavLinks.Item>
      ))}
    </NavLinks>
  )
}

function MobileNav({ tree }: { tree: PageTree.Root }) {
  const site = useSiteConfig()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [openedOn, setOpenedOn] = useState(pathname)
  // Close the sheet once a link in it has been followed.
  if (pathname !== openedOn) {
    setOpenedOn(pathname)
    setOpen(false)
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <IconButton label="Open navigation" icon={<MenuIcon />} variant="ghost" hideAbove="lg" />
      </Sheet.Trigger>
      <Sheet.Content side="left" title={`${site.name} docs`} size="sm">
        <div className={styles.sheetSections}>
          <SectionLinks />
        </div>
        <SidebarNav tree={tree} />
      </Sheet.Content>
    </Sheet>
  )
}

/** The chrome around every page: the header, the sidebar on docs pages, and the footer. */
export function DocsShell({ tree, children }: { tree?: PageTree.Root; children: ReactNode }) {
  const site = useSiteConfig()
  return (
    <AppShell navBreakpoint="lg" className={styles.shell}>
      <AppShell.Header>
        <Container width="full">
          <Inline justify="between" gap={4} wrap={false}>
            <Inline gap={5} wrap={false}>
              {tree ? <MobileNav tree={tree} /> : null}
              <Wordmark />
              <SectionLinks hideBelow="md" />
            </Inline>
            <Inline gap={3} wrap={false}>
              <Search />
              <ThemeSwitcher />
            </Inline>
          </Inline>
        </Container>
      </AppShell.Header>
      {tree ? (
        <AppShell.Sidebar className={styles.sidebar}>
          <SidebarNav tree={tree} />
        </AppShell.Sidebar>
      ) : null}
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer>
        <Container width="full">
          <Inline justify="between" gap={4}>
            <Text size="sm" tone="muted">
              {site.footer.text}
            </Text>
            <NavLinks label="Elsewhere" size="sm">
              {site.footer.links.map((link) => (
                <NavLinks.Item key={link.href} href={link.href}>
                  {link.label}
                </NavLinks.Item>
              ))}
            </NavLinks>
          </Inline>
        </Container>
      </AppShell.Footer>
    </AppShell>
  )
}
