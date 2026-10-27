import { ThemeProvider, useTheme } from '@mitcsutt/kiln-ui'
import { useCallback, useState, type ReactNode } from 'react'

import { isDemoTheme, type DemoTheme } from '#constants/demoThemes'

const THEME_KEY = 'slipcast:theme'
export const MODE_KEY = 'slipcast:color-mode'

/**
 * The starting theme: `?theme=` in the address (the docs site embeds the demo that way), then the
 * reader's last choice, then Paper.
 */
function initialTheme(): DemoTheme {
  const fromUrl = new URLSearchParams(window.location.search).get('theme')
  if (isDemoTheme(fromUrl)) return fromUrl
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (isDemoTheme(stored)) return stored
  } catch {
    // Storage can be blocked; Paper it is.
  }
  return 'paper'
}

/**
 * kiln-ui's ThemeProvider keeps the colour mode; this store adds the theme, remembered between
 * visits. Every page reads and changes both through `useThemePreference`.
 */
export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(initialTheme)
  const onThemeChange = useCallback((next: string) => {
    if (!isDemoTheme(next)) return
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Not remembered, but still applied.
    }
  }, [])
  return (
    <ThemeProvider theme={theme} onThemeChange={onThemeChange} storageKey={MODE_KEY}>
      {children}
    </ThemeProvider>
  )
}

export function useThemePreference() {
  const { theme, setTheme, mode, resolvedMode, setMode } = useTheme()
  return {
    theme: isDemoTheme(theme) ? theme : 'paper',
    setTheme: setTheme as (theme: DemoTheme) => void,
    mode,
    resolvedMode,
    setMode,
  }
}
