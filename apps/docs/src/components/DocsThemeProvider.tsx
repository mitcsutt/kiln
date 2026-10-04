'use client'

import { ThemeProvider, useTheme, type BuiltInThemeName } from '@mitcsutt/kiln-ui'
import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { isBuiltInTheme, THEME_STORAGE_KEY } from '@/lib/theme'
import { useHydrated } from '@/lib/useHydrated'

const listeners = new Set<() => void>()
/** The choice made on this page, which outlives storage being unavailable. */
let picked: BuiltInThemeName | undefined

function readTheme(): BuiltInThemeName {
  if (picked) return picked
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isBuiltInTheme(stored) ? stored : 'paper'
  } catch {
    return 'paper'
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
 * already applied the stored choice, and writing the server's defaults would flash Paper.
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

export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'paper' as const)
  const setTheme = useCallback((next: string) => {
    if (!isBuiltInTheme(next)) return
    picked = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* storage unavailable: the choice lasts until the next page load */
    }
    for (const listener of listeners) listener()
  }, [])
  return (
    <ThemeProvider theme={theme} onThemeChange={setTheme} target="none">
      <DocumentAttributes />
      {children}
    </ThemeProvider>
  )
}
