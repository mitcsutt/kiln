/**
 * `themeScript`, on its own so it can load without React: the root entry re-exports it, and
 * `@mitcsutt/kiln-ui/theme-script` serves it to Node-side tooling, such as a Vite config that
 * writes it into a static `index.html` (ADR 0023).
 */
import { DEFAULT_THEME } from './themes'
import type { ColorMode, ThemeName } from './themes'

/** The localStorage key for the reader's colour mode, unless `storageKey` names another. */
export const DEFAULT_STORAGE_KEY = 'kiln-color-mode'

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
