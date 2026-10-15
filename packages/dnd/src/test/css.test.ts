// @vitest-environment node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

const COMPONENTS = join(dirname(new URL(import.meta.url).pathname), '../components')

function cssModules(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? cssModules(p) : p.endsWith('.module.css') ? [p] : []
  })
}

const name = (file: string) => file.split('components/')[1] ?? file

// kiln-ui's CSS rules (packages/ui/AGENTS.md, "CSS") apply here too.
describe('component CSS conventions', () => {
  const files = cssModules(COMPONENTS)
  const read = (file: string) => readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

  it('finds the modules', () => {
    expect(files.length).toBeGreaterThanOrEqual(6)
  })

  it('never reads a private --_var with a fallback', () => {
    const offenders = files.flatMap((f) =>
      [...read(f).matchAll(/var\(--_[a-z0-9-]+,/g)].map((m) => `${name(f)}: ${m[0]}`),
    )
    expect(offenders).toEqual([])
  })

  it('keeps component CSS unlayered', () => {
    expect(files.filter((f) => /@layer\s/.test(read(f))).map(name)).toEqual([])
  })

  it('uses no colour literals and no raw durations', () => {
    const offenders = files.flatMap((f) =>
      [...read(f).matchAll(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch)a?\(|\b\d+m?s\b/gi)].map(
        (m) => `${name(f)}: ${m[0]}`,
      ),
    )
    expect(offenders).toEqual([])
  })

  it('turns off movement under reduced motion wherever items move', () => {
    expect(read(join(COMPONENTS, 'GridLayout/GridLayout.module.css'))).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.item\s*\{\s*transition: none;/,
    )
  })
})
