import { Badge, NavLinks, NavLinksGroup, ScrollArea, Stack, Text } from '@mitcsutt/kiln-ui'
import { Link as RouterLink, useLocation } from '@tanstack/react-router'

import { NAV_AREAS } from '#app/constants/navigation'
import { DEMO_THEMES } from '#constants/demoThemes'

/** The side navigation: one group per area, each marked with the theme it was made for. */
export function AppNav() {
  const { pathname } = useLocation()
  return (
    <ScrollArea label="Navigation" axis="y">
      <Stack gap={4}>
        <NavLinks label="Main" orientation="vertical" size="sm">
          {NAV_AREAS.map((area) => {
            const Icon = area.icon
            if (area.pages.length === 1) {
              const page = area.pages[0]
              return page ? (
                <NavLinks.Item key={area.id} asChild icon={<Icon />} active={pathname === page.to}>
                  <RouterLink to={page.to}>{area.label}</RouterLink>
                </NavLinks.Item>
              ) : null
            }
            return (
              <NavLinksGroup
                key={area.id}
                label={area.label}
                icon={<Icon />}
                trailing={
                  <Badge variant="outline" size="sm">
                    {DEMO_THEMES[area.theme].label}
                  </Badge>
                }
                defaultOpen
              >
                {area.pages.map((page) => (
                  <NavLinks.Item key={page.to} asChild active={pathname === page.to}>
                    <RouterLink to={page.to}>{page.label}</RouterLink>
                  </NavLinks.Item>
                ))}
              </NavLinksGroup>
            )
          })}
        </NavLinks>
        <Text size="xs" tone="muted">
          All data is invented. Nothing leaves your browser.
        </Text>
      </Stack>
    </ScrollArea>
  )
}
