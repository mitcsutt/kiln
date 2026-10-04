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
import { Search } from './Search'
import { SidebarNav } from './SidebarNav'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Wordmark } from './Wordmark'
import styles from './DocsShell.module.css'

const SECTIONS = [
  { href: '/docs/ui', label: 'UI' },
  { href: '/docs/forms', label: 'Forms' },
  { href: '/docs/tooling', label: 'Tooling' },
] as const

const GITHUB = 'https://github.com/mitcsutt/kiln'

function MobileNav({ tree }: { tree: PageTree.Root }) {
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
      <Sheet.Content side="left" title="Kiln docs" size="sm">
        <SidebarNav tree={tree} />
      </Sheet.Content>
    </Sheet>
  )
}

export function DocsShell({ tree, children }: { tree?: PageTree.Root; children: ReactNode }) {
  const pathname = usePathname()
  return (
    <AppShell navBreakpoint="lg" className={styles.shell}>
      <AppShell.Header>
        <Container width="full">
          <Inline justify="between" gap={4} wrap={false}>
            <Inline gap={5} wrap={false}>
              {tree ? <MobileNav tree={tree} /> : null}
              <Wordmark />
              <NavLinks label="Sections" size="sm" hideBelow="md">
                {SECTIONS.map((section) => (
                  <NavLinks.Item
                    key={section.href}
                    asChild
                    active={pathname.startsWith(section.href)}
                  >
                    <NextLink href={section.href}>{section.label}</NextLink>
                  </NavLinks.Item>
                ))}
              </NavLinks>
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
              Kiln is MIT licensed. Nothing here is published to npm yet.
            </Text>
            <NavLinks label="Elsewhere" size="sm">
              <NavLinks.Item href={GITHUB}>Source on GitHub</NavLinks.Item>
              <NavLinks.Item href="/llms.txt">llms.txt</NavLinks.Item>
            </NavLinks>
          </Inline>
        </Container>
      </AppShell.Footer>
    </AppShell>
  )
}
