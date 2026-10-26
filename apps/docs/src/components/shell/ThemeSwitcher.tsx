'use client'

import { Inline, ModeToggle, Select, useTheme } from '@mitcsutt/kiln-ui'
import { site } from '@/lib/site'
import { themeLabel } from '@/lib/theme'

const options = site.theme.picker.map((name) => ({ value: name, label: themeLabel(name) }))

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
