import type { SiteConfig } from './config.ts'
import { MODE_STORAGE_KEY, THEME_STORAGE_KEY } from './storage.ts'

type ThemeConfig = Pick<SiteConfig, 'theme'>

/** Whether the header's picker offers `value`. */
export function isPickerTheme(config: ThemeConfig, value: unknown): value is string {
  return typeof value === 'string' && config.theme.picker.includes(value)
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
 * Applies the stored theme and mode before first paint, like kiln-ui's `themeScript`, but with
 * the theme read from storage too: a site with a picker lets a reader switch themes, and an app
 * built on Kiln usually fixes one.
 */
export function docsThemeScript(config: ThemeConfig): string {
  return `(function(){try{var d=document.documentElement;var t=localStorage.getItem(${scriptJson(
    THEME_STORAGE_KEY,
  )});d.dataset.theme=${scriptJson(config.theme.picker)}.indexOf(t)>-1?t:${quoted(config.theme.default)};var m=localStorage.getItem(${scriptJson(
    MODE_STORAGE_KEY,
  )});d.dataset.mode=(m==='light'||m==='dark'||m==='system')?m:'system';}catch(e){}})();`
}
