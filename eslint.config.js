import base from '@mitcsutt/kiln-eslint-config/base'
import docsStories from '@mitcsutt/kiln-eslint-config/docs-stories'
import node from '@mitcsutt/kiln-eslint-config/node'
import react from '@mitcsutt/kiln-eslint-config/react'
import storybook from '@mitcsutt/kiln-eslint-config/storybook'
import { defineConfig, globalIgnores } from 'eslint/config'

const FORMS_TUPLE_SELECTOR =
  'Tuple selectors re-render on every store change (a new array each time). Select a primitive (`s => s.isSubmitting`), or use `useSelector(store, sel, { compare: shallowEqual })`.'
const FORMS_SCHEMA_CORE =
  'schema/core is React-free: @mitcsutt/kiln-forms/schema must load on a server.'
const FORMS_NO_STYLING =
  'kiln-forms has no styling of its own: compose kiln-ui primitives through their props (packages/forms/AGENTS.md).'
// packages/forms/AGENTS.md: `#` subpath imports inside the package, kiln-ui from its barrel
// only, and no CSS.
const FORMS_IMPORT_PATTERNS = [
  { group: ['../*'], message: 'Import with a `#` subpath import (`#runtime/...`).' },
  { group: ['@mitcsutt/kiln-ui/*'], message: 'Import @mitcsutt/kiln-ui from its barrel.' },
  { group: ['*.css'], message: FORMS_NO_STYLING },
]

const FORMS_SYNTAX = [
  {
    selector:
      "JSXAttribute[name.name='selector'] > JSXExpressionContainer > ArrowFunctionExpression > ArrayExpression.body",
    message: FORMS_TUPLE_SELECTOR,
  },
  {
    selector:
      "JSXAttribute[name.name='selector'] > JSXExpressionContainer > :function ReturnStatement > ArrayExpression.argument",
    message: FORMS_TUPLE_SELECTOR,
  },
  { selector: "JSXAttribute[name.name='style']", message: FORMS_NO_STYLING },
  { selector: "JSXAttribute[name.name='className']", message: FORMS_NO_STYLING },
]
// One config for the whole workspace. Each package runs `eslint .` from its
// own directory and picks this file up, so lint stays cached per package.
export default defineConfig(
  base,
  // Written by the docs app's generators, Fumadocs MDX, Next.js and Wrangler.
  globalIgnores([
    'apps/docs/.source/',
    'apps/docs/.generated/',
    'apps/docs/.wrangler/',
    'apps/docs/next-env.d.ts',
    // Lint input for the kiln-structure tests: apps laid out right and wrong on purpose.
    'packages/structure/test/fixtures/',
  ]),
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
      'packages/structure/**',
      'packages/tsconfig/**',
      'packages/*/*.config.ts',
      'packages/*/scripts/**',
    ],
    extends: [node],
  },
  {
    name: 'kiln/workspace/docs',
    files: ['apps/docs/**'],
    extends: [react],
    rules: {
      // A private app has no consumers, so build-time and runtime dependencies are one list.
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, peerDependencies: true, optionalDependencies: false },
      ],
    },
  },
  {
    name: 'kiln/workspace/docs/routes',
    files: ['apps/docs/**/*.{jsx,tsx}'],
    rules: {
      // Next.js reads these named exports from route modules alongside the component.
      'react-refresh/only-export-components': [
        'error',
        {
          allowExportNames: [
            'metadata',
            'generateMetadata',
            'generateStaticParams',
            'dynamic',
            'revalidate',
            'viewport',
          ],
        },
      ],
    },
  },
  {
    // The docs app's own tooling runs in Node: config files, generators and the link checker.
    name: 'kiln/workspace/docs/node',
    files: ['apps/docs/*.{js,ts}', 'apps/docs/scripts/**', 'apps/docs/src/mdx/**'],
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
    name: 'kiln/workspace/forms',
    files: ['packages/forms/src/**'],
    extends: [react, storybook],
    rules: {
      // Compound layouts (`FormTabs.Tab`) follow the ui authoring standard, so the rule
      // is off here for the same reason as in ui (ADR 0015).
      'react-refresh/only-export-components': 'off',
      // packages/forms/AGENTS.md: a tuple selector re-renders on every store change (a new
      // array each time). Select a primitive, or use `useSelector` with `shallowEqual`.
      'no-restricted-syntax': ['error', ...FORMS_SYNTAX],
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: FORMS_IMPORT_PATTERNS }],
    },
  },
  {
    // ADR 0028: a story tagged `docs` is a docs example, the code readers copy.
    name: 'kiln/workspace/docs-stories',
    files: ['packages/*/src/**/*.stories.tsx'],
    extends: [docsStories],
  },
  {
    name: 'kiln/workspace/storybook',
    files: ['apps/storybook/**'],
    extends: [react, storybook],
    rules: {
      // A private app ships nothing to npm, so everything it uses is a dev dependency.
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, peerDependencies: true, optionalDependencies: false },
      ],
    },
  },
  {
    name: 'kiln/workspace/storybook/scripts',
    files: ['apps/storybook/scripts/**'],
    extends: [node],
  },
  {
    // packages/forms/AGENTS.md: `@mitcsutt/kiln-forms/schema` must load on a server, so
    // schema/core imports React, TanStack Form and kiln-ui for types only.
    // `schema/core/node.test.ts` catches React arriving transitively.
    name: 'kiln/workspace/forms/schema-core',
    files: ['packages/forms/src/schema/core/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: FORMS_SCHEMA_CORE },
            { name: 'react-dom', message: FORMS_SCHEMA_CORE },
            {
              name: '@tanstack/react-form',
              allowTypeImports: true,
              message: `${FORMS_SCHEMA_CORE} Import types only from @tanstack/react-form.`,
            },
            {
              name: '@mitcsutt/kiln-ui',
              allowTypeImports: true,
              message: `${FORMS_SCHEMA_CORE} Import types only from @mitcsutt/kiln-ui.`,
            },
          ],
          patterns: FORMS_IMPORT_PATTERNS,
        },
      ],
    },
  },
  {
    name: 'kiln/workspace/ui/test-support',
    files: [
      'packages/ui/src/test/**',
      'packages/forms/src/test/**',
      'packages/forms/src/stories/**',
      'packages/forms/src/**/*.test-d.{ts,tsx}',
    ],
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
    files: [
      'packages/ui/src/**/*.test.{ts,tsx}',
      // Forms tests and their harness read the same contract through kiln-ui, plus what
      // a form submits: hidden inputs and `name`s for FormData, and the wrapper that
      // carries `aria-describedby` on a group field (ADR 0017).
      'packages/forms/src/**/*.test.{ts,tsx}',
      'packages/forms/src/test/**',
    ],
    rules: {
      // A design system's DOM is part of its contract: themes and consumers style the
      // data attributes, slots and generated class names these tests assert on, and
      // most of those nodes have no accessible role to query by (ADR 0015).
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
    },
  },
  {
    name: 'kiln/workspace/forms/tests',
    files: ['packages/forms/src/**/*.test.{ts,tsx}'],
    rules: {
      // The axe helper asserts, and fails the test with the violations it finds.
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expectNoAxeViolations'] },
      ],
      // Parametrised suites name each test from its data (a fixture's name, a field kind).
      'vitest/valid-title': ['error', { allowArguments: true }],
    },
  },
)
