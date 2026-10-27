import { Button, CommandPalette, Inline, Kbd, SearchIcon, Text } from '@mitcsutt/kiln-ui'
import { useNavigate } from '@tanstack/react-router'

import { NAV_AREAS } from '#app/constants/navigation'
import { DEMO_THEME_NAMES, DEMO_THEMES } from '#constants/demoThemes'
import { useThemePreference } from '#stores/themePreference'

/** ⌘K: jump to any page, or switch theme and mode, from the keyboard. */
export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme, setMode } = useThemePreference()
  return (
    <CommandPalette
      shortcut="mod+k"
      placeholder="Search pages and actions"
      trigger={
        <Button variant="outline" tone="neutral" size="sm" leadingIcon={<SearchIcon />}>
          <Inline gap={2} align="center">
            <Text as="span" size="sm">
              Search
            </Text>
            <Kbd size="sm">⌘K</Kbd>
          </Inline>
        </Button>
      }
      actions={[
        ...NAV_AREAS.flatMap((area) =>
          area.pages.map((page) => ({
            id: page.to,
            label: page.label,
            group: area.label,
            onSelect: () => {
              void navigate({ to: page.to })
            },
          })),
        ),
        ...DEMO_THEME_NAMES.map((name) => ({
          id: `theme-${name}`,
          label: `Use the ${DEMO_THEMES[name].label} theme`,
          group: 'Appearance',
          keywords: ['theme', DEMO_THEMES[name].goal],
          onSelect: () => {
            setTheme(name)
          },
        })),
        {
          id: 'mode-dark',
          label: 'Dark mode',
          group: 'Appearance',
          keywords: ['night', 'theme'],
          onSelect: () => {
            setMode('dark')
          },
        },
        {
          id: 'mode-light',
          label: 'Light mode',
          group: 'Appearance',
          keywords: ['day', 'theme'],
          onSelect: () => {
            setMode('light')
          },
        },
      ]}
    />
  )
}
