'use client'

import { Inline, ModeToggle, Select, THEME_META, THEMES, useTheme } from '@mitcsutt/kiln-ui'
import { useSiteConfig } from '../SiteConfig.tsx'

/** The picker's label for a theme: a built-in's own, or a custom theme's name. */
function themeLabel(name: string): string {
  return (THEMES as readonly string[]).includes(name)
    ? THEME_META[name as (typeof THEMES)[number]].label
    : name
}

/** Re-themes the whole site, chrome included: every page is a preview of every theme. */
export function ThemeSwitcher() {
  const { theme: config } = useSiteConfig()
  const { theme, setTheme } = useTheme()
  return (
    <Inline gap={2} wrap={false}>
      <Select
        aria-label="Theme"
        size="md"
        options={config.picker.map((name) => ({ value: name, label: themeLabel(name) }))}
        value={theme}
        onValueChange={setTheme}
      />
      <ModeToggle size="md" />
    </Inline>
  )
}
