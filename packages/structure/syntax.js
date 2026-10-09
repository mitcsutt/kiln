import { builtinRules } from 'eslint/use-at-your-own-risk'
import { reactRefresh } from 'eslint-plugin-react-refresh'

import { DEFAULT_EXPORT_FILES, TEST_FILES, sourceGlobs } from './conventions.js'

/**
 * The rules core ESLint expresses (ADR 0037): what `index.ts` may hold, relative imports, named
 * exports, plus Fast Refresh boundaries. The core rules are registered again under the
 * `kiln-structure/` prefix, unchanged, so their options never collide with a project's own
 * `no-restricted-syntax` or `no-restricted-imports`.
 *
 * @typedef {import('./options.js').NormalizedOptions} NormalizedOptions
 */

// `builtinRules` is ESLint's only way to reach a core rule's module. Its type is marked deprecated
// with no replacement, so a release that drops it fails here, loudly, when the config loads.
// eslint-disable-next-line @typescript-eslint/no-deprecated
const noRestrictedSyntax = builtinRules.get('no-restricted-syntax')
// eslint-disable-next-line @typescript-eslint/no-deprecated
const noRestrictedImports = builtinRules.get('no-restricted-imports')
if (!noRestrictedSyntax || !noRestrictedImports) {
  throw new Error(
    'kilnStructure: this ESLint version no longer exposes no-restricted-syntax or no-restricted-imports.',
  )
}

/** @type {import('eslint').ESLint.Plugin} */
export const kilnStructurePlugin = {
  meta: { name: '@mitcsutt/kiln-structure' },
  rules: {
    'index-file': noRestrictedSyntax,
    'named-exports': noRestrictedSyntax,
    'relative-imports': noRestrictedImports,
  },
}

const CODE = '{js,jsx,ts,tsx,mjs,cjs,mts,cts}'

/** @param {string} text */
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * @param {NormalizedOptions} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function syntaxConfigs(options) {
  const { srcDir: src, kinds, groups, router } = options
  const { inSrc, generated, namingExempt, routeFiles } = sourceGlobs(options)

  // `./X` reaches a sibling. `./<kind>/<Module>` and `./<kind>/<group>/<Module>` reach a child
  // module, which lands on its index.ts. Nothing reaches further down.
  const kindAlternatives = kinds.map(escapeRegExp).join('|')
  const groupAlternatives = Object.entries(groups)
    .map(([kind, names]) => `${escapeRegExp(kind)}/(?:${names.map(escapeRegExp).join('|')})/[^/]+`)
    .join('|')
  const allowedRelative = [
    `[^/]+`,
    `(?:${kindAlternatives})/[^/]+`,
    ...(groupAlternatives ? [groupAlternatives] : []),
  ]

  return [
    {
      name: 'kiln-structure/syntax/plugin',
      plugins: { 'kiln-structure': kilnStructurePlugin },
    },
    {
      name: 'kiln-structure/relative-imports',
      files: [`${src}/**/*.${CODE}`],
      ignores: generated,
      rules: {
        'kiln-structure/relative-imports': [
          'error',
          {
            patterns: [
              {
                regex: '^\\.\\.(?:/|$)',
                message:
                  '`../` is banned. Import anything outside this folder by its `#` path (ADR 0037).',
              },
              {
                regex: `^\\./(?!(?:${allowedRelative.join('|')})$)`,
                message:
                  '`./` reaches a sibling (`./X`) or one child module (`./<kind>/<Module>`), never a file inside it. Use the `#` path (ADR 0037).',
              },
            ],
          },
        ],
      },
    },
    {
      name: 'kiln-structure/index-file',
      files: [`${src}/**/index.{ts,tsx}`],
      ignores: [...namingExempt, ...routeFiles],
      rules: {
        'kiln-structure/index-file': [
          'error',
          {
            selector: 'Program > :not(ExportNamedDeclaration[source])',
            message:
              "index.ts holds only named re-exports: `export { X } from './X'`. No `export *`, imports or declarations.",
          },
          {
            selector: 'ExportNamedDeclaration[source][source.value!=/^\\.\\u002F[^.\\u002F]+$/]',
            message: "index.ts re-exports only files in its own folder: `export { X } from './X'`.",
          },
          {
            selector: 'Program[body.length=0]',
            message: "index.ts re-exports the module's main file: `export { X } from './X'`.",
          },
        ],
      },
    },
    {
      name: 'kiln-structure/named-exports',
      files: [`${src}/**/*.${CODE}`],
      ignores: [
        ...namingExempt,
        ...inSrc(DEFAULT_EXPORT_FILES),
        ...(router === 'next' ? routeFiles : []),
      ],
      rules: {
        'kiln-structure/named-exports': [
          'error',
          {
            selector: 'ExportDefaultDeclaration',
            message:
              'Use a named export. Default exports are only for files a tool requires them in.',
          },
          {
            selector: 'ExportSpecifier[exported.name="default"]',
            message:
              'Use a named export. Default exports are only for files a tool requires them in.',
          },
        ],
      },
    },
    {
      name: 'kiln-structure/react-refresh',
      files: [`${src}/**/*.{jsx,tsx}`],
      ignores: [...inSrc(TEST_FILES), ...namingExempt, ...routeFiles],
      plugins: { 'react-refresh': reactRefresh.plugin },
      rules: {
        'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      },
    },
    {
      // A context store exports its provider and its hook from one file (ADR 0037).
      name: 'kiln-structure/react-refresh/stores',
      files: [`${src}/**/stores/**`],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  ]
}
