import path from 'node:path'

import react from '@mitcsutt/kiln-eslint-config/react'
import { ESLint } from 'eslint'
import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import kilnStructure from '../eslint.js'
import { assertFeatureGraph } from '../options.js'
import type { KilnStructureOptions } from '../types/eslint.js'

const features = { dashboard: ['contacts'], contacts: [] }

/** Calls the preset with input its types don't allow, as a JavaScript config could. */
function loadUntyped(options: unknown) {
  return () => kilnStructure(options as KilnStructureOptions)
}

describe('the feature graph', () => {
  it('fails on load with the cycle it found', () => {
    expect(() => kilnStructure({ features: { a: ['b'], b: ['a'] } })).toThrow(
      'kilnStructure: feature cycle: a -> b -> a',
    )
    expect(() =>
      kilnStructure({
        features: { dashboard: ['contacts'], contacts: ['campaigns'], campaigns: ['contacts'] },
      }),
    ).toThrow('feature cycle: contacts -> campaigns -> contacts')
  })

  it('fails on a feature that depends on itself', () => {
    expect(() => kilnStructure({ features: { a: ['a'] } })).toThrow('feature cycle: a -> a')
  })

  it('fails on an edge to an undeclared feature', () => {
    expect(() => kilnStructure({ features: { dashboard: ['billing'] } })).toThrow(
      'feature "dashboard" depends on "billing", which isn\'t declared in `features`.',
    )
  })

  it('accepts a graph without cycles, and keeps edges as declared', () => {
    expect(assertFeatureGraph({ a: ['b', 'c'], b: ['c'], c: [] })).toEqual({
      a: ['b', 'c'],
      b: ['c'],
      c: [],
    })
  })

  it('fails without a graph, or with one of the wrong shape', () => {
    expect(loadUntyped(undefined)).toThrow('pass an options object')
    expect(loadUntyped({})).toThrow('`features` is required')
    expect(loadUntyped({ features: ['contacts'] })).toThrow('`features` is required')
    expect(loadUntyped({ features: { contacts: 'auth' } })).toThrow(
      'features.contacts must be an array of strings.',
    )
    expect(loadUntyped({ features: { Contacts: [] } })).toThrow('must be a kebab-case folder name')
  })
})

describe('options', () => {
  it('fails on an unknown option', () => {
    expect(loadUntyped({ features, kind: ['lib'] })).toThrow('unknown option `kind`.')
    expect(loadUntyped({ features, ignores: { files: [] } })).toThrow(
      'unknown option `ignores.files`.',
    )
  })

  it("doesn't let a kind rename or repeat the core", () => {
    expect(() => kilnStructure({ features, kinds: ['hooks'] })).toThrow(
      "Core kinds can't be renamed",
    )
    expect(() => kilnStructure({ features, kinds: ['features'] })).toThrow('already a core kind')
    expect(() => kilnStructure({ features, kinds: ['my-kind'] })).toThrow('camelCase folder name')
    expect(() => kilnStructure({ features, testKind: 'stores' })).toThrow('`testKind`')
    expect(() => kilnStructure({ features, kinds: ['specs'], testKind: 'specs' })).toThrow(
      'already a core kind',
    )
  })

  it('checks groups against the kinds', () => {
    expect(() => kilnStructure({ features, groups: { widgets: ['sections'] } })).toThrow(
      'groups: "widgets" isn\'t a kind.',
    )
    expect(() => kilnStructure({ features, groups: { components: ['hooks'] } })).toThrow(
      'clashes with a kind',
    )
    expect(() =>
      kilnStructure({ features, kinds: ['lib'], groups: { lib: ['clients'] } }),
    ).not.toThrow()
  })

  it('checks router and srcDir', () => {
    expect(loadUntyped({ features, router: 'remix' })).toThrow(
      "`router` must be one of 'tanstack', 'next'.",
    )
    expect(() => kilnStructure({ features, srcDir: '../src' })).toThrow('`srcDir`')
    expect(() => kilnStructure({ features, srcDir: '/src' })).toThrow('`srcDir`')
  })
})

describe('the config', () => {
  const configs = kilnStructure({ features, kinds: ['lib'], groups: { components: ['sections'] } })

  it('names every config object', () => {
    for (const config of configs) expect(config.name).toMatch(/^kiln-structure\//)
  })

  it('has no warning tier: every rule is an error or off', () => {
    const severities = configs.flatMap((config: Linter.Config) =>
      Object.values(config.rules ?? {}).map((entry) => (Array.isArray(entry) ? entry[0] : entry)),
    )
    expect(severities.length).toBeGreaterThan(0)
    for (const severity of severities) expect(['error', 'off']).toContain(severity)
  })

  it('applies to the source folder only', () => {
    for (const config of configs) {
      for (const glob of config.files ?? []) expect(String(glob)).toMatch(/^src\//)
    }
  })

  it('composes with @mitcsutt/kiln-eslint-config, which registers react-refresh too', async () => {
    const cwd = path.join(import.meta.dirname, 'fixtures/tanstack-app')
    const eslint = new ESLint({
      cwd,
      overrideConfigFile: true,
      overrideConfig: [...react, ...kilnStructure({ features, rootDir: cwd })],
    })
    const config = (await eslint.calculateConfigForFile(
      'src/stores/themePreference/themePreference.tsx',
    )) as Linter.Config
    // Off in stores/: the computed entry is `[0, options]`.
    expect(config.rules?.['react-refresh/only-export-components']).toEqual([0, expect.anything()])
  })
})
