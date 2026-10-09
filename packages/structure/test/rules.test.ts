import fs from 'node:fs'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import type { KilnStructureOptions } from '../types/eslint.js'
import { APP_OPTIONS, cleanUp, lintApp, rewriteFiles } from './lint.js'

afterAll(cleanUp)

const BOUNDARIES = 'boundaries/dependencies'
const UNKNOWN = 'boundaries/no-unknown-dependencies'
const FOLDERS = 'project-structure/folder-structure'
const INDEX = 'kiln-structure/index-file'
const RELATIVE = 'kiln-structure/relative-imports'
const NAMED = 'kiln-structure/named-exports'
const REFRESH = 'react-refresh/only-export-components'

const NEXT_OPTIONS = { ...APP_OPTIONS, router: 'next' } satisfies KilnStructureOptions

describe('valid apps', () => {
  it('lints the TanStack Router app with no errors', async () => {
    const { messages } = await lintApp('tanstack-app', APP_OPTIONS)
    expect(messages).toEqual([])
  })

  it('lints the Next.js app with no errors', async () => {
    const { messages } = await lintApp('next-app', NEXT_OPTIONS)
    expect(messages).toEqual([])
  })

  it('takes route and root-file conventions from `router`', async () => {
    // TanStack Router's `routes/` and `main.tsx` mean nothing to the Next.js conventions.
    const { counts, messages } = await lintApp('tanstack-app', NEXT_OPTIONS)
    expect(counts[FOLDERS]).toBe(2)
    expect(messages.map((m) => m.message).join('\n')).toContain("Folder 'routes' is invalid")
  })
})

/**
 * Each case lays a few files over a valid app (`test/fixtures/invalid/<case>`) and lists the
 * exact errors it must produce, by rule.
 */
const CASES: {
  overlay: string
  rule: string
  expected: Record<string, number>
  options?: KilnStructureOptions
}[] = [
  // Owners and feature boundaries
  {
    overlay: 'owner-scope',
    rule: "a page's private module, from another page",
    expected: { [BOUNDARIES]: 1 },
  },
  {
    overlay: 'feature-private',
    rule: "another feature's pages and private modules",
    expected: { [BOUNDARIES]: 2 },
  },
  {
    overlay: 'feature-direction',
    rule: 'an import against the declared graph',
    expected: { [BOUNDARIES]: 1 },
  },
  {
    overlay: 'shared-imports-feature',
    rule: 'shared code importing a feature or app/',
    expected: { [BOUNDARIES]: 2 },
  },
  {
    overlay: 'route-private',
    rule: "a route importing a feature's private module and test support",
    expected: { [BOUNDARIES]: 2 },
  },
  {
    overlay: 'app-private',
    rule: "app/ importing a feature's private module",
    expected: { [BOUNDARIES]: 1 },
  },
  {
    overlay: 'test-kind-private',
    rule: 'the test-support kind, from code that is not a test',
    expected: { [BOUNDARIES]: 2 },
  },
  {
    overlay: 'test-kind-undeclared-feature',
    rule: "a test importing an undeclared feature's test support",
    expected: { [BOUNDARIES]: 1 },
  },
  {
    overlay: 'naming-exempt-still-bounded',
    rule: 'a naming exemption that still imports a private module',
    expected: { [BOUNDARIES]: 1 },
    options: { ...APP_OPTIONS, ignores: { naming: ['legacy/**'] } },
  },
  // Relative imports
  {
    overlay: 'relative-into-module',
    rule: './ into a file inside a child module',
    expected: { [RELATIVE]: 1, [BOUNDARIES]: 1 },
  },
  {
    overlay: 'relative-grandchild',
    rule: './ two modules down',
    expected: { [RELATIVE]: 1, [BOUNDARIES]: 1 },
  },
  { overlay: 'relative-parent', rule: '../', expected: { [RELATIVE]: 1 } },
  // index.ts
  { overlay: 'index-export-star', rule: 'export * in index.ts', expected: { [INDEX]: 1 } },
  {
    overlay: 'index-declaration',
    rule: 'an import and a declaration in index.ts',
    expected: { [INDEX]: 2 },
  },
  {
    overlay: 'index-child-reexport',
    rule: 'index.ts re-exporting a child module',
    expected: { [INDEX]: 1 },
  },
  { overlay: 'index-empty', rule: 'an empty index.ts', expected: { [INDEX]: 1 } },
  {
    overlay: 'module-without-main',
    rule: 'a module with no main file',
    expected: { [UNKNOWN]: 1 },
  },
  // Folder shape
  {
    overlay: 'undeclared-feature',
    rule: 'a feature folder missing from the graph',
    expected: { [FOLDERS]: 1 },
  },
  {
    overlay: 'module-without-index',
    rule: 'a module with no index.ts',
    expected: { [FOLDERS]: 1 },
  },
  {
    overlay: 'loose-file-in-kind',
    rule: 'a file directly in a kind folder',
    expected: { [FOLDERS]: 1 },
  },
  {
    overlay: 'main-file-name',
    rule: 'a file not named after its module',
    expected: { [FOLDERS]: 1 },
  },
  {
    overlay: 'second-dot',
    rule: 'a second dot that is not a tool suffix',
    expected: { [FOLDERS]: 1 },
  },
  {
    overlay: 'unknown-kind',
    rule: 'a kind that is neither core nor declared',
    expected: { [FOLDERS]: 1 },
  },
  {
    overlay: 'extra-kind',
    rule: 'a kind that is only declared in another repo',
    expected: { [FOLDERS]: 1, [BOUNDARIES]: 1 },
  },
  { overlay: 'nested-pages', rule: 'pages/ below a feature root', expected: { [FOLDERS]: 1 } },
  { overlay: 'nested-data', rule: 'data/ below a feature root', expected: { [FOLDERS]: 1 } },
  {
    overlay: 'nested-test-kind',
    rule: 'the test kind below a feature root',
    expected: { [FOLDERS]: 1 },
  },
  { overlay: 'undeclared-group', rule: 'a group that is not declared', expected: { [FOLDERS]: 1 } },
  {
    overlay: 'feature-index',
    rule: 'an index.ts for a whole feature',
    expected: { [FOLDERS]: 1, [INDEX]: 1 },
  },
  { overlay: 'kind-index', rule: 'an index.ts for a kind folder', expected: { [FOLDERS]: 1 } },
  // Exports
  { overlay: 'default-export', rule: 'a default export in a module', expected: { [NAMED]: 1 } },
  {
    overlay: 'react-refresh',
    rule: 'a component file exporting a function',
    expected: { [REFRESH]: 1 },
  },
  {
    overlay: 'context-outside-stores',
    rule: 'a context provider and hook outside stores/',
    expected: { [REFRESH]: 1 },
  },
  // Next.js
  {
    overlay: 'next-route-private',
    rule: "an App Router page importing a feature's private module",
    expected: { [BOUNDARIES]: 1 },
    options: NEXT_OPTIONS,
  },
  {
    overlay: 'next-shell-shape',
    rule: 'a module in app/_shell with no index.ts',
    expected: { [FOLDERS]: 1 },
    options: NEXT_OPTIONS,
  },
  {
    overlay: 'next-shell-default-export',
    rule: 'a default export in app/_shell',
    expected: { [NAMED]: 1 },
    options: NEXT_OPTIONS,
  },
  {
    overlay: 'next-shared-imports-shell',
    rule: 'shared code importing app/_shell',
    expected: { [BOUNDARIES]: 1 },
    options: NEXT_OPTIONS,
  },
]

describe('invalid cases', () => {
  it('has a case for every overlay folder', () => {
    const folders = fs.readdirSync(path.join(import.meta.dirname, 'fixtures/invalid')).sort()
    expect(CASES.map((c) => c.overlay).sort()).toEqual(folders)
  })

  it.each(CASES)('$overlay: $rule', async ({ overlay, expected, options }) => {
    const app = options?.router === 'next' ? 'next-app' : 'tanstack-app'
    const { counts } = await lintApp(app, options ?? APP_OPTIONS, overlay)
    expect(counts).toEqual(expected)
  })
})

describe('options', () => {
  it('accepts a declared extra kind', async () => {
    const { messages } = await lintApp(
      'tanstack-app',
      { ...APP_OPTIONS, kinds: ['lib'] },
      'extra-kind',
    )
    expect(messages).toEqual([])
  })

  it('stops checking the imports of `ignores.boundaries` files', async () => {
    const { messages } = await lintApp(
      'tanstack-app',
      { ...APP_OPTIONS, ignores: { naming: ['legacy/**'], boundaries: ['legacy/**'] } },
      'naming-exempt-still-bounded',
    )
    expect(messages).toEqual([])
  })

  it('takes the test-support kind from `testKind`', async () => {
    const renameTestKind = (dir: string) => {
      fs.renameSync(path.join(dir, 'src/testing'), path.join(dir, 'src/specs'))
      fs.renameSync(
        path.join(dir, 'src/features/contacts/testing'),
        path.join(dir, 'src/features/contacts/specs'),
      )
      rewriteFiles(path.join(dir, 'src'), (text) =>
        text.replaceAll('#testing/', '#specs/').replaceAll('/testing/', '/specs/'),
      )
    }
    const valid = await lintApp(
      'tanstack-app',
      { ...APP_OPTIONS, testKind: 'specs' },
      undefined,
      renameTestKind,
    )
    expect(valid.messages).toEqual([])

    // `specs` is private the same way: the overlay imports it from a data module.
    const invalid = await lintApp(
      'tanstack-app',
      { ...APP_OPTIONS, testKind: 'specs' },
      'test-kind-private',
      renameTestKind,
    )
    expect(invalid.counts).toEqual({ [BOUNDARIES]: 2 })
  })

  it('takes the source folder from `srcDir`', async () => {
    const moveSource = (dir: string) => {
      fs.renameSync(path.join(dir, 'src'), path.join(dir, 'source'))
      rewriteFiles(dir, (text) => text.replaceAll('./src/', './source/'))
    }
    const valid = await lintApp(
      'tanstack-app',
      { ...APP_OPTIONS, srcDir: 'source' },
      undefined,
      moveSource,
    )
    expect(valid.messages).toEqual([])
  })

  it('names the rule and the folder in folder errors', async () => {
    const { messages } = await lintApp('tanstack-app', APP_OPTIONS, 'undeclared-feature')
    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain("Folder 'billing' is invalid")
    expect(messages[0]?.message).toContain('(dashboard|campaigns|contacts)')
  })
})
