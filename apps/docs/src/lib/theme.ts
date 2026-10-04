import { THEMES, type BuiltInThemeName } from '@mitcsutt/kiln-ui'

/** Where the docs remember the theme picked in the header. The colour mode uses kiln-ui's own key. */
export const THEME_STORAGE_KEY = 'kiln-docs-theme'
export const MODE_STORAGE_KEY = 'kiln-color-mode'

export function isBuiltInTheme(value: unknown): value is BuiltInThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

/**
 * Applies the stored theme and mode before first paint, like kiln-ui's `themeScript`, but
 * with the theme read from storage too: the docs let a reader switch themes, and an app
 * built on Kiln usually fixes one.
 */
export const docsThemeScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});d.dataset.theme=${JSON.stringify(THEMES)}.indexOf(t)>-1?t:'paper';var m=localStorage.getItem(${JSON.stringify(
  MODE_STORAGE_KEY,
)});d.dataset.mode=(m==='light'||m==='dark'||m==='system')?m:'system';}catch(e){}})();`
