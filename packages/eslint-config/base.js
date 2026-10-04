import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import tseslint from 'typescript-eslint'

import { CONFIG_FILES, SOURCE_FILES, STORY_FILES, TEST_FILES } from './globs.js'
import { asErrors } from './severity.js'

/**
 * The baseline for every Kiln project: JavaScript and TypeScript rules
 * (type-aware), import hygiene, and Vitest rules for test files.
 *
 * Type-aware rules need a TypeScript project for each linted file. Set
 * `languageOptions.parserOptions.tsconfigRootDir` in your own config.
 */
export default defineConfig(
  {
    name: 'kiln/base/ignores',
    ignores: ['**/dist/**', '**/coverage/**', '**/storybook-static/**', '**/.next/**', '**/out/**'],
  },
  {
    name: 'kiln/base/linter-options',
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },
  {
    name: 'kiln/base/javascript',
    files: SOURCE_FILES,
    extends: [js.configs.recommended],
  },
  {
    name: 'kiln/base/typescript',
    files: SOURCE_FILES,
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
  {
    name: 'kiln/base/imports',
    files: SOURCE_FILES,
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    rules: {
      'import-x/first': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [...TEST_FILES, ...STORY_FILES, ...CONFIG_FILES],
          peerDependencies: true,
          optionalDependencies: false,
        },
      ],
    },
  },
  {
    name: 'kiln/base/tests',
    files: TEST_FILES,
    extends: [asErrors(vitest.configs.recommended)],
    rules: {
      // Vitest's `expect` takes an optional failure message.
      'vitest/valid-expect': ['error', { maxArgs: 2 }],
    },
  },
  {
    name: 'kiln/base/prettier',
    extends: [prettier],
  },
)
