import { createContext, useContext } from 'react'
import { DEFAULT_THEME } from './themes'
import type { ColorMode, ThemeName } from './themes'

export interface ThemeContextValue {
  theme: ThemeName
  mode: ColorMode
  /** The mode actually rendered once `system` is resolved (`light` during SSR). */
  resolvedMode: 'light' | 'dark'
  setTheme: (theme: ThemeName) => void
  setMode: (mode: ColorMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

/** The localStorage key for the reader's colour mode, unless `storageKey` names another. */
export const DEFAULT_STORAGE_KEY = 'kiln-color-mode'

/** Read and change the current theme/mode. Must be inside `<ThemeProvider>`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme() must be used inside <ThemeProvider>.')
  return ctx
}

/** JSON for an inline `<script>`: `<` is escaped so a name can never close the tag. */
function scriptLiteral(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export interface ThemeScriptOptions {
  /** The localStorage key the mode is read from. Use the same key as `<ThemeProvider>`. */
  storageKey?: string
}

/**
 * Inline script for the document `<head>` that applies the theme and the stored colour
 * mode (or `defaultMode` when nothing is stored) before first paint. Use the same `theme`,
 * `defaultMode` and `storageKey` as `<ThemeProvider>`. Only needed with SSR (or a static
 * `index.html`) + a user-selectable mode. Any theme name works, built-in or your own.
 */
export function themeScript(
  theme: ThemeName = DEFAULT_THEME,
  defaultMode: ColorMode = 'system',
  { storageKey = DEFAULT_STORAGE_KEY }: ThemeScriptOptions = {},
): string {
  return `(function(){try{var d=document.documentElement;d.dataset.theme=${scriptLiteral(
    theme,
  )};var m=localStorage.getItem(${scriptLiteral(storageKey)});d.dataset.mode=(m==='light'||m==='dark'||m==='system')?m:${scriptLiteral(
    defaultMode,
  )};}catch(e){}})();`
}
