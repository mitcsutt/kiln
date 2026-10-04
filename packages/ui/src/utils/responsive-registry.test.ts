import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { BREAKPOINTS } from './responsive'

const SRC = resolve(__dirname, '..')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory()
      ? walk(p)
      : p.endsWith('.tsx') && !p.includes('.stories.')
        ? [p]
        : []
  })
}

describe('responsive prop registry', () => {
  it('registers every responsiveVars() name as a non-inheriting @property', () => {
    const registry = readFileSync(join(SRC, 'tokens/responsive-props.css'), 'utf8')
    const names = new Set<string>()
    for (const file of walk(join(SRC, 'components'))) {
      for (const m of readFileSync(file, 'utf8').matchAll(
        /responsiveVars\(\s*['"`]([a-z0-9-]+)['"`]/g,
      )) {
        if (m[1]) names.add(m[1])
      }
    }
    expect(names.size).toBeGreaterThan(0)
    const missing = [...names].flatMap((n) =>
      BREAKPOINTS.map((bp) => `--${n}-${bp}`).filter((v) => !registry.includes(`@property ${v} {`)),
    )
    expect(missing).toEqual([])
  })
})
