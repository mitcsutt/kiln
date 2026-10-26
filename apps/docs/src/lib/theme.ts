import { THEME_META, THEMES, type BuiltInThemeName } from '@mitcsutt/kiln-ui'
import { site } from './site'

/** Where the docs remember the theme picked in the header. The colour mode uses kiln-ui's own key. */
export const THEME_STORAGE_KEY = 'kiln-docs-theme'
export const MODE_STORAGE_KEY = 'kiln-color-mode'

/** Whether the header's picker offers `value`. */
export function isPickerTheme(value: unknown): value is string {
  return typeof value === 'string' && (site.theme.picker as readonly string[]).includes(value)
}

function isBuiltInTheme(name: string): name is BuiltInThemeName {
  return (THEMES as readonly string[]).includes(name)
}

/** The picker's label for a theme: a built-in's own, or a custom theme's name. */
export function themeLabel(name: string): string {
  return isBuiltInTheme(name) ? THEME_META[name].label : name
}

/** A string literal in single quotes for an inline `<script>`, where `<` can't close the tag. */
function quoted(value: string): string {
  return `'${value.replace(/[\\']/g, '\\$&').replace(/</g, '\\u003c')}'`
}

/**
 * Applies the stored theme and mode before first paint, like kiln-ui's `themeScript`, but
 * with the theme read from storage too: the docs let a reader switch themes, and an app
 * built on Kiln usually fixes one.
 */
export const docsThemeScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});d.dataset.theme=${JSON.stringify(site.theme.picker)}.indexOf(t)>-1?t:${quoted(site.theme.default)};var m=localStorage.getItem(${JSON.stringify(
  MODE_STORAGE_KEY,
)});d.dataset.mode=(m==='light'||m==='dark'||m==='system')?m:'system';}catch(e){}})();`
