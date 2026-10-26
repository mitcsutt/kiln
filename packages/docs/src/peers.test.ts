import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

const manifest = JSON.parse(
  readFileSync(join(import.meta.dirname, '../package.json'), 'utf8'),
) as Record<string, Record<string, string> | undefined>
const workspace = parse(
  readFileSync(join(import.meta.dirname, '../../../pnpm-workspace.yaml'), 'utf8'),
) as { catalog?: Record<string, string> }

/** A dependency's range in the workspace catalog. */
const catalog = (name: string) => workspace.catalog?.[name]

// ADR 0045, "Peers and the peer policy".
describe('peers', () => {
  it('declares the fumadocs pair it is tested with', () => {
    // A wider caret fails a fresh install: fumadocs-mdx@15.4.10 needs fumadocs-core ^16.17.8.
    expect(manifest.peerDependencies).toMatchObject({
      'fumadocs-core': '~16.15.18',
      'fumadocs-mdx': '~15.4.6',
    })
  })

  it('declares React 19, Next.js 16 and zod 4', () => {
    expect(manifest.peerDependencies).toMatchObject({
      next: '^16.3.8',
      react: '^19.2.0',
      'react-dom': '^19.2.0',
      zod: '^4.0.0',
    })
  })

  it('tests against the catalog, which holds the same pair', () => {
    for (const name of ['fumadocs-core', 'fumadocs-mdx', 'next']) {
      expect(catalog(name), name).toBe(manifest.peerDependencies?.[name])
      expect(manifest.devDependencies?.[name], name).toBe('catalog:')
    }
  })

  it('publishes real ranges only', () => {
    const ranges = { ...manifest.dependencies, ...manifest.peerDependencies }
    expect(Object.values(ranges).filter((range) => /^(workspace|catalog):/.test(range))).toEqual([])
  })
})
