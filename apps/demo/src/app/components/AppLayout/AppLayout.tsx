import {
  AppShell,
  Avatar,
  BottomNav,
  Container,
  Inline,
  Link,
  Text,
  Toaster,
  TooltipProvider,
  VisuallyHidden,
} from '@mitcsutt/kiln-ui'
import { Link as RouterLink, Outlet, useLocation } from '@tanstack/react-router'

import { NAV_AREAS } from '#app/constants/navigation'
import { CURRENT_USER } from '#data/currentUser'

import { AppNav } from './components/AppNav'
import { CommandMenu } from './components/CommandMenu'
import { NoticesMenu } from './components/NoticesMenu'
import { ThemeMenu } from './components/ThemeMenu'

/** The frame around every page: header, side navigation on wide screens, a bottom bar on phones. */
export function AppLayout() {
  const { pathname } = useLocation()
  return (
    <TooltipProvider>
      <AppShell navBreakpoint="lg">
        <AppShell.Header>
          <Container width="full">
            <Inline justify="between" align="center" gap={3}>
              <Link asChild underline="hover" tone="default">
                <RouterLink to="/">
                  <Text weight="strong">Slipcast</Text>
                  <VisuallyHidden>, home</VisuallyHidden>
                </RouterLink>
              </Link>
              <Inline gap={2} align="center">
                <CommandMenu />
                <ThemeMenu />
                <NoticesMenu />
                <Avatar name={CURRENT_USER.name} size="sm" />
              </Inline>
            </Inline>
          </Container>
        </AppShell.Header>
        <AppShell.Sidebar>
          <AppNav />
        </AppShell.Sidebar>
        <AppShell.Main>
          <Container width="wide">
            <Outlet />
          </Container>
        </AppShell.Main>
        <AppShell.BottomBar>
          <BottomNav position="static" hideAbove="lg" label="Areas">
            {NAV_AREAS.map((area) => {
              const Icon = area.icon
              const home = area.pages[0]?.to ?? '/'
              const active = home === '/' ? pathname === '/' : pathname.startsWith(home)
              return (
                <BottomNav.Item
                  key={area.id}
                  asChild
                  icon={<Icon />}
                  label={area.short}
                  active={active}
                >
                  <RouterLink to={home} />
                </BottomNav.Item>
              )
            })}
          </BottomNav>
        </AppShell.BottomBar>
      </AppShell>
      <Toaster />
    </TooltipProvider>
  )
}
