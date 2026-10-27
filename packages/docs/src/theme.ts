import { themeScript } from '@mitcsutt/kiln-ui/theme-script'
import type { SiteConfig } from './config.ts'
import { MODE_STORAGE_KEY, THEME_STORAGE_KEY } from './storage.ts'

type ThemeConfig = Pick<SiteConfig, 'theme'>

/** Whether the header's picker offers `value`. A fixed theme has no picker. */
export function isPickerTheme(config: ThemeConfig, value: unknown): value is string {
  return (
    'picker' in config.theme && typeof value === 'string' && config.theme.picker.includes(value)
  )
}

/** The theme a page starts on: the fixed theme, or the picker's default. */
export function initialTheme(config: ThemeConfig): string {
  return 'fixed' in config.theme ? config.theme.fixed : config.theme.default
}

/** A string literal in single quotes for an inline `<script>`, where `<` can't close the tag. */
function quoted(value: string): string {
  return `'${value.replace(/[\\']/g, '\\$&').replace(/</g, '\\u003c')}'`
}

/** JSON for an inline `<script>`: `<` is escaped so a name can never close the tag. */
function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/**
 * Applies the theme and the stored mode before first paint. A fixed theme uses kiln-ui's own
 * `themeScript`, with the theme a constant. A picker reads the theme from storage too, so a
 * reader's pick sticks.
 */
export function docsThemeScript(config: ThemeConfig): string {
  const { theme } = config
  if ('fixed' in theme) return themeScript(theme.fixed, 'system', { storageKey: MODE_STORAGE_KEY })
  return `(function(){try{var d=document.documentElement;var t=localStorage.getItem(${scriptJson(
    THEME_STORAGE_KEY,
  )});d.dataset.theme=${scriptJson(theme.picker)}.indexOf(t)>-1?t:${quoted(theme.default)};var m=localStorage.getItem(${scriptJson(
    MODE_STORAGE_KEY,
  )});d.dataset.mode=(m==='light'||m==='dark'||m==='system')?m:'system';}catch(e){}})();`
}
