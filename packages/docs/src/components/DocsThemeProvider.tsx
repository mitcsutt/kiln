'use client'

import { ThemeProvider, useTheme } from '@mitcsutt/kiln-ui'
import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import type { SiteConfig } from '../config.ts'
import { THEME_STORAGE_KEY } from '../storage.ts'
import { initialTheme, isPickerTheme } from '../theme.ts'
import { useSiteConfig } from './SiteConfig.tsx'
import { useHydrated } from './useHydrated.ts'

const listeners = new Set<() => void>()
/** The choice made on this page, which outlives storage being unavailable. */
let picked: string | undefined

function readTheme(config: SiteConfig): string {
  if (picked) return picked
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isPickerTheme(config, stored) ? stored : initialTheme(config)
  } catch {
    return initialTheme(config)
  }
}

function subscribe(onChange: () => void): () => void {
  // Another tab changed the theme: follow it.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return
    picked = undefined
    onChange()
  }
  listeners.add(onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/**
 * Writes `data-theme` and `data-mode` once hydrated. Before that, the head script has
 * already applied the stored choice, and writing the server's defaults would flash the default theme.
 */
function DocumentAttributes() {
  const { theme, mode } = useTheme()
  const hydrated = useHydrated()
  useEffect(() => {
    if (!hydrated) return
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.mode = mode
  }, [hydrated, theme, mode])
  return null
}

/**
 * The theme and colour mode for the whole site. A picker's theme is the reader's pick, kept in
 * storage; a fixed theme never changes, and the mode is kiln-ui's own.
 */
export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const config = useSiteConfig()
  const theme = useSyncExternalStore(
    subscribe,
    () => readTheme(config),
    () => initialTheme(config),
  )
  const setTheme = useCallback(
    (next: string) => {
      if (!isPickerTheme(config, next)) return
      picked = next
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        /* storage unavailable: the choice lasts until the next page load */
      }
      for (const listener of listeners) listener()
    },
    [config],
  )
  return (
    <ThemeProvider theme={theme} onThemeChange={setTheme} target="none">
      <DocumentAttributes />
      {children}
    </ThemeProvider>
  )
}
