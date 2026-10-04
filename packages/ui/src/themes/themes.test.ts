import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { must } from '#test/must'

/*
 * QA-A11Y-6: custom properties inherit, so a token only fiesta sets (its gold-row text inks)
 * leaked into a nested `<ThemeScope theme="ledger">` and failed contrast. Every token a theme
 * sets must be set by every other theme too, or reset on `[data-theme]` in foundation.css.
 */
const read = (path: string) =>
  readFileSync(resolve(__dirname, path), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const declared = (css: string) =>
  new Set([...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => must(m[1])))

const THEMES = ['paper', 'monograph', 'ledger', 'fiesta'] as const

function resetOnEveryTheme(): Set<string> {
  const foundation = read('../tokens/foundation.css')
  const blocks = [...foundation.matchAll(/(?:^|\n)\s*\[data-theme\]\s*\{([^}]*)\}/g)].map(
    (m) => m[1] ?? '',
  )
  return new Set(blocks.flatMap((block) => [...declared(block)]))
}

describe('theme token coverage', () => {
  const tokens = Object.fromEntries(
    THEMES.map((theme) => [theme, declared(read(`./${theme}.css`))]),
  )
  const reset = resetOnEveryTheme()

  it('every token a theme sets is set by all themes or reset on [data-theme] (no leak into nested scopes)', () => {
    const offenders = THEMES.flatMap((theme) =>
      [...(tokens[theme] ?? [])]
        .filter((token) => !token.startsWith('--_') && !reset.has(token))
        .filter((token) => THEMES.some((other) => !tokens[other]?.has(token)))
        .map((token) => `${theme}: ${token}`),
    )
    expect(offenders).toEqual([])
  })
})
