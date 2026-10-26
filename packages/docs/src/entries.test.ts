import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const ENTRIES = {
  '@mitcsutt/kiln-docs': [
    'DOCS_BASE_URL',
    'MODE_STORAGE_KEY',
    'THEME_STORAGE_KEY',
    'createDocsSite',
    'variantStorageKey',
  ],
  '@mitcsutt/kiln-docs/config': ['DEFAULT_CONTENT_DIR', 'DEFAULT_GENERATED_DIR', 'defineSite'],
  '@mitcsutt/kiln-docs/generate': ['writeGenerated'],
}

// ADR 0045: in the workspace the entries point at erasable `.ts` source with explicit `.ts`
// imports, which Node loads as it is, with no bundler and no `node` condition.
describe('the entries', () => {
  it('load in plain Node', () => {
    const script = `for (const entry of ${JSON.stringify(Object.keys(ENTRIES))}) console.log(JSON.stringify([entry, Object.keys(await import(entry)).sort()]))`
    const output = execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
      cwd: join(import.meta.dirname, '..'),
      encoding: 'utf8',
    })
    const loaded = Object.fromEntries(
      output
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line) as [string, string[]]),
    )
    expect(loaded).toEqual(ENTRIES)
  })
})
