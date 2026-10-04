import base from '@mitcsutt/kiln-eslint-config/base'
import node from '@mitcsutt/kiln-eslint-config/node'
import react from '@mitcsutt/kiln-eslint-config/react'
import storybook from '@mitcsutt/kiln-eslint-config/storybook'
import { defineConfig } from 'eslint/config'

// One config for the whole workspace. Each package runs `eslint .` from its
// own directory and picks this file up, so lint stays cached per package.
export default defineConfig(
  base,
  {
    name: 'kiln/workspace/type-aware',
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    name: 'kiln/workspace/node',
    files: [
      '*.{js,ts}',
      'packages/eslint-config/**',
      'packages/prettier-config/**',
      'packages/tsconfig/**',
      'packages/*/*.config.ts',
      'packages/*/scripts/**',
    ],
    extends: [node],
  },
  {
    // Build and report tooling shared by the packages, like the config files.
    name: 'kiln/workspace/tooling',
    files: ['vite.library.ts', 'size-report.ts'],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, peerDependencies: true, optionalDependencies: false },
      ],
    },
  },
  {
    name: 'kiln/workspace/ui',
    files: ['packages/ui/src/**'],
    extends: [react, storybook],
    rules: {
      // Compound components (`Card.Title`, `Table.Row`) are the authoring standard
      // (packages/ui/AGENTS.md): one module exports `Object.assign(Root, { … })`, which
      // Fast Refresh can't treat as a boundary. A library module isn't an app's HMR
      // boundary anyway, so the rule is off here (ADR 0015).
      'react-refresh/only-export-components': 'off',
      // `role="list"` on a `list-style: none` list is deliberate: Safari drops list
      // semantics without it.
      'jsx-a11y/no-redundant-roles': ['error', { nav: ['navigation'], ul: ['list'], ol: ['list'] }],
      // A scrolling code block must take keyboard focus so it can be scrolled
      // without a mouse (WCAG 2.1.1).
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: ['pre'], roles: ['tabpanel'], allowExpressionValues: true },
      ],
    },
  },
  {
    name: 'kiln/workspace/ui/test-support',
    files: ['packages/ui/src/test/**'],
    rules: {
      // Test setup and helpers, like test files, may import dev dependencies.
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, peerDependencies: true, optionalDependencies: false },
      ],
    },
  },
  {
    name: 'kiln/workspace/ui/tests',
    files: ['packages/ui/src/**/*.test.{ts,tsx}'],
    rules: {
      // A design system's DOM is part of its contract: themes and consumers style the
      // data attributes, slots and generated class names these tests assert on, and
      // most of those nodes have no accessible role to query by (ADR 0015).
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
    },
  },
)
