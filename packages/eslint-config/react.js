import { defineConfig } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import testingLibrary from 'eslint-plugin-testing-library'
import globals from 'globals'

import { JSX_FILES, SOURCE_FILES, STORY_FILES, TEST_FILES, TEST_SUPPORT_FILES } from './globs.js'
import { asErrors } from './severity.js'

/**
 * React rules: hooks, Fast Refresh boundaries, JSX accessibility, and Testing
 * Library rules for test files. Combine it with `base`.
 */
export default defineConfig(
  {
    name: 'kiln/react/browser',
    files: SOURCE_FILES,
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    name: 'kiln/react/hooks',
    files: SOURCE_FILES,
    extends: [asErrors(reactHooks.configs.flat.recommended)],
  },
  {
    name: 'kiln/react/refresh',
    files: JSX_FILES,
    ignores: [...TEST_FILES, ...TEST_SUPPORT_FILES, ...STORY_FILES],
    extends: [reactRefresh.configs.vite()],
  },
  {
    name: 'kiln/react/a11y',
    files: SOURCE_FILES,
    extends: [asErrors(jsxA11y.flatConfigs.recommended)],
    rules: {
      // A named scroll region must be focusable so keyboard users can scroll it (axe's
      // scrollable-region-focusable), so `region` joins the plugin's default `tabpanel`.
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: true },
      ],
    },
  },
  {
    name: 'kiln/react/tests',
    files: TEST_FILES,
    extends: [asErrors(testingLibrary.configs['flat/react'])],
  },
)
