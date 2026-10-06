'use client'

import { Inline, ModeToggle, Select, THEME_META, THEMES, useTheme } from '@mitcsutt/kiln-ui'

const options = THEMES.map((name) => ({ value: name, label: THEME_META[name].label }))

/** Re-themes the whole site, chrome included: every page is a preview of every theme. */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <Inline gap={2} wrap={false}>
      <Select
        aria-label="Theme"
        size="md"
        options={options}
        value={theme}
        onValueChange={setTheme}
      />
      <ModeToggle size="md" />
    </Inline>
  )
}
