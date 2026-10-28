import { DropdownMenu, IconButton, ModeToggle, PaletteIcon, Tooltip } from '@mitcsutt/kiln-ui'

import { DEMO_THEME_NAMES, DEMO_THEMES, isDemoTheme } from '#constants/demoThemes'
import { useThemePreference } from '#stores/themePreference'

/** Switches between the four built-in themes, and between light and dark. */
export function ThemeMenu() {
  const { theme, setTheme } = useThemePreference()
  return (
    <>
      <DropdownMenu>
        <Tooltip content={`Theme: ${DEMO_THEMES[theme].label}`}>
          <DropdownMenu.Trigger asChild>
            <IconButton variant="ghost" label="Change theme" icon={<PaletteIcon />} />
          </DropdownMenu.Trigger>
        </Tooltip>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Theme</DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={theme}
            onValueChange={(next) => {
              if (isDemoTheme(next)) setTheme(next)
            }}
          >
            {DEMO_THEME_NAMES.map((name) => (
              <DropdownMenu.RadioItem key={name} value={name}>
                {DEMO_THEMES[name].label}: {DEMO_THEMES[name].goal.toLowerCase()}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
      <ModeToggle size="sm" />
    </>
  )
}
