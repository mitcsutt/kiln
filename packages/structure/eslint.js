import tseslint from 'typescript-eslint'

import { boundariesConfigs } from './boundaries.js'
import { folderStructureConfigs } from './folder-structure.js'
import { normalizeOptions } from './options.js'
import { syntaxConfigs } from './syntax.js'

/**
 * The ESLint preset for Kiln's recommended React app structure (ADR 0037). It returns a list of
 * flat config objects that apply to the source folder only.
 *
 * Throws when the options are invalid, including a feature graph with a cycle or an edge to an
 * undeclared feature.
 *
 * @param {import('./types/eslint.d.ts').KilnStructureOptions} options
 * @returns {import('eslint').Linter.Config[]}
 */
export default function kilnStructure(options) {
  const normalized = normalizeOptions(options)
  const { srcDir } = normalized

  return [
    {
      name: 'kiln-structure/parser',
      files: [`${srcDir}/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}`],
      languageOptions: { parser: tseslint.parser },
    },
    ...folderStructureConfigs(normalized),
    ...boundariesConfigs(normalized),
    ...syntaxConfigs(normalized),
  ]
}
