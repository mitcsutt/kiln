'use client'

import { Inline, ModeToggle, Select, THEME_META, THEMES, useTheme } from '@mitcsutt/kiln-ui'
import { useSiteConfig } from '../SiteConfig.tsx'

/** The picker's label for a theme: a built-in's own, or a custom theme's name. */
function themeLabel(name: string): string {
  return (THEMES as readonly string[]).includes(name)
    ? THEME_META[name as (typeof THEMES)[number]].label
    : name
}

/**
 * The header's theme controls. A picker re-themes the whole site, chrome included, so every page
 * is a preview of every theme. A fixed theme has the mode toggle only, or nothing with
 * `modeToggle: false`.
 */
export function ThemeSwitcher() {
  const { theme: config } = useSiteConfig()
  const { theme, setTheme } = useTheme()
  if ('fixed' in config) return config.modeToggle === false ? null : <ModeToggle size="md" />
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
