import { createRequire } from 'node:module'

import boundaries from 'eslint-plugin-boundaries'

import { ROUTES, TEST_FILES, sourceGlobs } from './conventions.js'
import { PUBLIC_KINDS } from './options.js'

/**
 * Import rules (ADR 0037) as `eslint-plugin-boundaries` policies: owners, each feature's public
 * surface, the declared feature graph, routes and `app/` as the composition root, shared code
 * that never imports features, and the private test-support kind.
 *
 * @typedef {import('./options.js').NormalizedOptions} NormalizedOptions
 */

const TYPESCRIPT_RESOLVER = createRequire(import.meta.url).resolve(
  'eslint-import-resolver-typescript',
)

/** A name that no feature can have, for a feature that may import no other feature. */
const NO_FEATURE = '__kiln_no_feature__'

/**
 * A micromatch brace list. `{a}` with one item matches literally and captures nothing, so a single
 * item is repeated. Alternation like `(a|b)` doesn't match at all in boundaries patterns.
 *
 * @param {readonly string[]} items
 */
export function braces(items) {
  return `{${(items.length === 1 ? [items[0], items[0]] : items).join(',')}}`
}

/**
 * @param {NormalizedOptions} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function boundariesConfigs(options) {
  const { srcDir, kinds, groups, testKind, router, features, rootDir } = options
  const src = srcDir
  const routes = ROUTES[router]
  const { generated, namingExempt, routeFiles } = sourceGlobs(options)
  const indexIgnores = [...namingExempt, ...routeFiles]
  const allKinds = [...kinds, 'pages', 'data', testKind, 'config']

  /** @type {Record<string, unknown>[]} */
  const elements = [
    ...Object.entries(groups).map(([kind, names]) => ({
      type: 'module',
      pattern: `${braces([kind])}/${braces(names)}/*`,
      capture: ['kind', 'group', 'name'],
    })),
    { type: 'module', pattern: `${braces(allKinds)}/*`, capture: ['kind', 'name'] },
    { type: 'feature', pattern: `${src}/features/*`, capture: ['feature'] },
    ...(router === 'next'
      ? [
          { type: 'app', pattern: `${src}/app/_shell` },
          { type: 'routes', pattern: `${src}/app` },
        ]
      : [
          { type: 'app', pattern: `${src}/app` },
          { type: 'routes', pattern: `${src}/${routes.folder}` },
        ]),
    { type: 'assets', pattern: `${src}/assets` },
  ]

  const indexFile = 'index.{ts,tsx}'
  const publicModule = (
    /** @type {string[]} */ featureNames,
    extraKinds = /** @type {string[]} */ ([]),
  ) => ({
    type: 'module',
    captured: { kind: [...PUBLIC_KINDS, ...extraKinds] },
    parent: {
      type: 'feature',
      captured: { feature: featureNames.length ? featureNames : NO_FEATURE },
    },
    fileInternalPath: indexFile,
  })
  const testModule = { type: 'module', captured: { kind: testKind } }
  const testFile = { file: { categories: 'test' } }
  const featureNames = Object.keys(features)
  const insideFeature = (/** @type {string} */ feature) => ({
    element: { parents: { anyOf: [{ type: 'feature', captured: { feature } }] } },
  })

  const policies = [
    // Packages and Node built-ins are out of scope.
    { allow: { to: { origin: ['external', 'core'] } } },
    // Owners: a file may import its own module, its child modules, its siblings and the siblings
    // of any module it sits in. Grandchildren and anything further down are private.
    { allow: { dependency: { relationship: { to: ['internal', 'child', 'sibling', 'uncle'] } } } },
    // Shared modules in `src/<kind>/` belong to the whole app.
    { allow: { to: { element: { type: 'module', parent: null, fileInternalPath: indexFile } } } },
    // Assets are exempt from the owner rule.
    { allow: { to: { element: { type: 'assets' } } } },
    // Another module is reached through its index.ts only.
    {
      disallow: {
        to: { element: { fileInternalPath: `!${indexFile}` } },
        dependency: { relationship: { to: ['child', 'sibling', 'uncle'] } },
      },
    },
    // Features import each other's public surface, in the declared direction only.
    ...featureNames.map((feature) => ({
      from: insideFeature(feature),
      allow: { to: { element: publicModule(features[feature] ?? []) } },
    })),
    // Routes and the composition root import pages plus the public surface of any feature.
    {
      from: { element: { type: 'routes' } },
      allow: { to: { element: publicModule(featureNames, ['pages']) } },
    },
    {
      from: { element: { parents: { anyOf: [{ type: 'app' }] } } },
      allow: { to: { element: publicModule(featureNames, ['pages']) } },
    },
    // Routes and the entry point import the composition root.
    {
      from: [{ element: { type: 'routes' } }, { file: { categories: 'entry' } }],
      allow: {
        to: {
          element: {
            type: 'module',
            parents: { anyOf: [{ type: 'app' }] },
            fileInternalPath: indexFile,
          },
        },
      },
    },
    // Files outside every element (a naming exemption such as a legacy folder) import each other
    // freely, but the rules above still hold for what they import from the structure.
    { from: { element: { type: null } }, allow: { to: { element: { type: null } } } },
    // Root files (the entry point, global CSS, a router factory) import each other.
    {
      from: { file: { categories: 'entry' } },
      allow: { to: { file: { categories: 'entry' } } },
    },
    // The test-support kind is private: only tests and stories import it.
    { disallow: { to: { element: testModule } } },
    {
      from: testFile,
      allow: {
        to: { element: { ...testModule, fileInternalPath: indexFile } },
        dependency: { relationship: { to: ['sibling', 'uncle'] } },
      },
    },
    {
      from: testFile,
      allow: { to: { element: { ...testModule, parent: null, fileInternalPath: indexFile } } },
    },
    ...featureNames.map((feature) => ({
      from: { ...testFile, ...insideFeature(feature) },
      allow: {
        to: {
          element: {
            ...testModule,
            parent: {
              type: 'feature',
              captured: { feature: features[feature]?.length ? features[feature] : NO_FEATURE },
            },
            fileInternalPath: indexFile,
          },
        },
      },
    })),
  ]

  return [
    {
      name: 'kiln-structure/boundaries',
      files: [`${src}/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}`],
      plugins: {
        boundaries: /** @type {import('eslint').ESLint.Plugin} */ (
          /** @type {unknown} */ (boundaries)
        ),
      },
      settings: {
        // boundaries loads resolvers by name from the linted file, which a strict package
        // manager hides, so the resolver this package depends on is named by its path.
        'import/resolver': { [TYPESCRIPT_RESOLVER]: { alwaysTryTypes: true } },
        'boundaries/elements': elements,
        'boundaries/files': [
          { category: 'test', pattern: TEST_FILES },
          { category: 'entry', pattern: `${src}/*` },
          // Every other source file, so that one outside any element (a naming exemption such as
          // a legacy folder) is still checked rather than skipped as unknown.
          { category: 'source', pattern: `${src}/**` },
        ],
        'boundaries/ignore': generated,
        'boundaries/root-path': rootDir,
        'boundaries/legacy-templates': false,
      },
      rules: {
        'boundaries/dependencies': ['error', { default: 'disallow', policies }],
      },
    },
    {
      // A module's index.ts re-exports files that exist. With the folder rules, which allow only
      // the main file as a sibling without a second dot, this is what makes the main file
      // required: project-structure can't require "Name.ts or Name.tsx".
      name: 'kiln-structure/boundaries/index-file',
      files: [`${src}/**/index.{ts,tsx}`],
      ignores: indexIgnores,
      rules: { 'boundaries/no-unknown-dependencies': 'error' },
    },
  ]
}
