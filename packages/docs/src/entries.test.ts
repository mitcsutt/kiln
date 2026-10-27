import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

/** The entries Node loads outside a bundler: the site's config files and the bin load them. */
const NODE_ENTRIES = {
  '@mitcsutt/kiln-docs/config': [
    'DEFAULT_CONTENT_DIR',
    'DEFAULT_GENERATED_DIR',
    'DEFAULT_SEARCH_PROVIDER',
    'SEARCH_ROUTE',
    'defineSite',
  ],
  '@mitcsutt/kiln-docs/generate': ['writeGenerated'],
  '@mitcsutt/kiln-docs/mdx-config': [
    'defineDocsCollections',
    'defineDocsConfig',
    'rehypeRawAsText',
    'remarkCodeTitle',
  ],
  '@mitcsutt/kiln-docs/next': ['MARKDOWN_REWRITES', 'withKilnDocs'],
  '@mitcsutt/kiln-docs/variants': ['createVariants', 'dedent'],
}

// ADR 0045: in the workspace the entries point at erasable `.ts` source with explicit `.ts`
// imports, which Node loads as it is, with no bundler and no `node` condition.
describe('the entries', () => {
  it('load in plain Node', () => {
    const script = `for (const entry of ${JSON.stringify(Object.keys(NODE_ENTRIES))}) console.log(JSON.stringify([entry, Object.keys(await import(entry)).sort()]))`
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
    expect(loaded).toEqual(NODE_ENTRIES)
  })

  // The root entry holds the chrome, which the site's bundler compiles: TSX and CSS Modules.
  it('export the site and the storage keys from the root', async () => {
    expect(Object.keys(await import('@mitcsutt/kiln-docs')).sort()).toEqual([
      'DOCS_BASE_URL',
      'MODE_STORAGE_KEY',
      'THEME_STORAGE_KEY',
      'createDocsSite',
      'variantStorageKey',
    ])
  })

  it('run the bin from the workspace shim', () => {
    const run = () =>
      execFileSync(process.execPath, [join(import.meta.dirname, '../bin/kiln-docs.js')], {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    expect(run).toThrow(/Usage: kiln-docs <command>/)
  })
})
