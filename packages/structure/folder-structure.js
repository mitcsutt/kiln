import { projectStructureParser, projectStructurePlugin } from 'eslint-plugin-project-structure'

import { namingExemptions, ROUTES } from './conventions.js'

/**
 * Folder shape (ADR 0037) as an `eslint-plugin-project-structure` config: kinds and groups, module
 * folders, where `pages/`, `data/` and the test-support kind may sit, declared features, and the
 * second-dot allowlist. The plugin has a single maintainer, so everything that touches it lives in
 * this file, ready to swap.
 *
 * @typedef {import('./options.js').NormalizedOptions} NormalizedOptions
 * @typedef {import('eslint-plugin-project-structure').FolderStructureConfig} FolderStructureConfig
 * @typedef {Exclude<FolderStructureConfig['structure'], unknown[]>} Rule
 */

/** Tool suffixes a module's files may carry: the only allowed second dots. */
const TOOL_SUFFIXES = ['test', 'spec', 'stories', 'mock']
const STYLE_EXTENSIONS = '(css|scss|sass|less)'

/** A module folder is named in PascalCase or camelCase, and its main file takes the same name. */
const MODULE_RULES = /** @type {const} */ ({
  kiln_module_Pascal: { folder: '{PascalCase}', self: '{FolderName}' },
  kiln_module_camel: { folder: '{camelCase}', self: '{folderName}' },
})

/**
 * @param {NormalizedOptions} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function folderStructureConfigs(options) {
  const { srcDir, kinds, groups, testKind, router, features, rootDir } = options
  const routes = ROUTES[router]

  /** @type {Rule[]} */
  const moduleRefs = Object.keys(MODULE_RULES).map((ruleId) => ({ ruleId }))

  /**
   * A kind folder holds modules, and the groups declared for it, which hold modules only.
   *
   * @param {string[]} names
   * @returns {Rule[]}
   */
  const kindFolders = (names) =>
    names.map((kind) => ({
      name: kind,
      children: [
        ...(groups[kind] ?? []).map((group) => ({ name: group, children: moduleRefs })),
        ...moduleRefs,
      ],
    }))

  /** @type {Record<string, Rule>} */
  const rules = {}
  for (const [ruleId, { folder, self }] of Object.entries(MODULE_RULES)) {
    rules[ruleId] = {
      name: folder,
      // `enforceExistence` takes literal paths, so it can't require "Name.ts or Name.tsx". The
      // main file is required through index.ts instead (see boundaries.js).
      enforceExistence: ['index.ts'],
      children: [
        { name: 'index.ts' },
        { name: `${self}(.(${TOOL_SUFFIXES.join('|')}))?.(ts|tsx)` },
        { name: `${self}.module.${STYLE_EXTENSIONS}` },
        // Kind folders for what only this module uses. pages/, data/ and the test kind never
        // sit below a feature root.
        ...kindFolders(kinds),
      ],
    }
  }

  const featureNames = Object.keys(features)
  /** @type {Rule[]} */
  const structure = [
    ...kindFolders([...kinds, 'data', testKind, 'config']),
    // Only declared features. (An empty `children` would allow anything, so no declared features
    // means no `features/` folder.)
    ...(featureNames.length
      ? [
          {
            name: 'features',
            children: [
              {
                name: `(${featureNames.join('|')})`,
                children: kindFolders([...kinds, 'pages', 'data', testKind]),
              },
            ],
          },
        ]
      : []),
    router === 'next'
      ? {
          name: routes.folder,
          children: [
            { name: '_shell', children: kindFolders(kinds) },
            // Everything else in `app/` belongs to the App Router.
            { name: '*', children: [] },
            { name: '*' },
          ],
        }
      : { name: routes.folder, children: [] },
    ...(router === 'next' ? [] : [{ name: 'app', children: kindFolders(kinds) }]),
    // Assets are exempt from the owner rule, and grouped however the project likes.
    { name: 'assets', children: [] },
  ]

  /** @type {FolderStructureConfig} */
  const config = {
    // The plugin otherwise takes the project root from where it's installed, which is wrong in a
    // monorepo.
    projectRoot: rootDir,
    structureRoot: srcDir,
    longPathsInfo: false,
    ignorePatterns: [...namingExemptions(router), ...options.ignores.naming],
    structure,
    rules,
  }

  return [
    {
      name: 'kiln-structure/folder-structure',
      files: [`${srcDir}/**/*`],
      plugins: {
        'project-structure': /** @type {import('eslint').ESLint.Plugin} */ (
          /** @type {unknown} */ (projectStructurePlugin)
        ),
      },
      // The plugin reports each folder error once and remembers it in a cache file
      // (`projectStructure.cache.json`), which belongs in .gitignore.
      settings: { 'project-structure/cache-location': rootDir },
      rules: { 'project-structure/folder-structure': ['error', config] },
    },
    {
      // Stylesheets have no JavaScript parser, but their names and places are still checked.
      name: 'kiln-structure/folder-structure/styles',
      files: [`${srcDir}/**/*.{css,scss,sass,less}`],
      languageOptions: { parser: projectStructureParser },
    },
  ]
}
