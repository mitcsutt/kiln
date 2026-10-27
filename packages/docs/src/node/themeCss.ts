import { globSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import type { SiteConfig } from '../config.ts'

/** kiln-ui's base theme: its `styles.css` holds it, so it needs no preset import. */
export const BASE_THEME = 'paper'

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A selector for the theme: `[data-theme='riso']`, `[data-theme="riso"]`, or `[data-theme=riso]`
 * as minified CSS writes it.
 */
export function themeSelector(name: string): RegExp {
  return new RegExp(`\\[data-theme=(["']?)${escape(name)}\\1\\]`)
}

/** The themes a site offers readers, but the base theme, which every export has. */
export function configuredThemes(config: Pick<SiteConfig, 'theme'>): string[] {
  return [...new Set(config.theme.picker)].filter((name) => name !== BASE_THEME)
}

/** The themes no stylesheet in `css` styles. */
export function missingThemes(css: readonly string[], themes: readonly string[]): string[] {
  return themes.filter((name) => !css.some((text) => themeSelector(name).test(text)))
}

/** What the site imports for a theme: kiln-ui's preset when there is one, else its own stylesheet. */
function importFor(root: string, name: string): string {
  const preset = `@mitcsutt/kiln-ui/themes/${name}.css`
  try {
    createRequire(join(root, 'package.json')).resolve(preset)
    return `import '${preset}'`
  } catch {
    return `the stylesheet that defines [data-theme='${name}']`
  }
}

/**
 * Fails, naming the import to add, when a theme the site offers has no CSS in the static export:
 * its picker would switch to an unstyled theme (ADR 0045). The selectors are matched with or
 * without quotes, because the built CSS is minified.
 */
export function checkThemeCss(
  root: string,
  out: string,
  config: Pick<SiteConfig, 'theme'>,
): string[] {
  const css = globSync('_next/static/**/*.css', { cwd: out }).map((file) =>
    readFileSync(join(out, file), 'utf8'),
  )
  return missingThemes(css, configuredThemes(config)).map(
    (name) =>
      `The ${name} theme has no CSS in the export. Add ${importFor(root, name)} to the root layout (app/layout.tsx).`,
  )
}
