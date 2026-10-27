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

// ADR 0046: in the workspace the entries point at erasable `.ts` source with explicit `.ts`
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

  // ADR 0047: each route segment has its own entry, so it imports only its own UI and CSS.
  it('export one factory or component from each route segment entry', async () => {
    const segments = {
      '@mitcsutt/kiln-docs/layout': await import('@mitcsutt/kiln-docs/layout'),
      '@mitcsutt/kiln-docs/docs-layout': await import('@mitcsutt/kiln-docs/docs-layout'),
      '@mitcsutt/kiln-docs/docs-page': await import('@mitcsutt/kiln-docs/docs-page'),
      '@mitcsutt/kiln-docs/not-found': await import('@mitcsutt/kiln-docs/not-found'),
      '@mitcsutt/kiln-docs/shell': await import('@mitcsutt/kiln-docs/shell'),
    }
    expect(
      Object.fromEntries(
        Object.entries(segments).map(([entry, module]) => [entry, Object.keys(module)]),
      ),
    ).toEqual({
      '@mitcsutt/kiln-docs/layout': ['createRootLayout'],
      '@mitcsutt/kiln-docs/docs-layout': ['createDocsLayout'],
      '@mitcsutt/kiln-docs/docs-page': ['createDocsPage'],
      '@mitcsutt/kiln-docs/not-found': ['NotFound'],
      '@mitcsutt/kiln-docs/shell': ['Shell'],
    })
    // Each imports the chrome and kiln-ui's source, which takes a while beside other test files.
  }, 30_000)

  it('run the bin from the workspace shim', () => {
    const run = () =>
      execFileSync(process.execPath, [join(import.meta.dirname, '../bin/kiln-docs.js')], {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    expect(run).toThrow(/Usage: kiln-docs <command>/)
  })
})
