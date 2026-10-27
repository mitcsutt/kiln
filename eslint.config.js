import base from '@mitcsutt/kiln-eslint-config/base'
import docsStories from '@mitcsutt/kiln-eslint-config/docs-stories'
import node from '@mitcsutt/kiln-eslint-config/node'
import react from '@mitcsutt/kiln-eslint-config/react'
import storybook from '@mitcsutt/kiln-eslint-config/storybook'
import kilnStructure from '@mitcsutt/kiln-structure/eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const FORMS_TUPLE_SELECTOR =
  'Tuple selectors re-render on every store change (a new array each time). Select a primitive (`s => s.isSubmitting`), or use `useSelector(store, sel, { compare: shallowEqual })`.'
const FORMS_SCHEMA_CORE =
  'schema/core is React-free: @mitcsutt/kiln-forms/schema must load on a server.'
const FORMS_NO_STYLING =
  'kiln-forms has no styling of its own: compose kiln-ui primitives through their props (packages/forms/AGENTS.md).'
// packages/forms/AGENTS.md: `#` subpath imports inside the package, kiln-ui from its barrel
// only, and no CSS.
const FORMS_DND =
  'kiln-dnd is an optional peer: only src/dnd (the @mitcsutt/kiln-forms/dnd entry) imports it (ADR 0043).'
const FORMS_IMPORT_PATTERNS = [
  { group: ['../*'], message: 'Import with a `#` subpath import (`#runtime/...`).' },
  { group: ['@mitcsutt/kiln-ui/*'], message: 'Import @mitcsutt/kiln-ui from its barrel.' },
  { group: ['*.css'], message: FORMS_NO_STYLING },
  { group: ['@mitcsutt/kiln-dnd', '@mitcsutt/kiln-dnd/*'], message: FORMS_DND },
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
// packages/dnd/AGENTS.md: `#` subpath imports inside the package, kiln-ui from its barrel
// only, and the drag engine imported by src/core/engine.ts alone (ADR 0040).
const DND_ENGINE =
  'Only src/core/engine.ts imports the drag engine; everything else uses Kiln types (ADR 0040).'
const DND_IMPORT_PATTERNS = [
  { group: ['../*'], message: 'Import with a `#` subpath import (`#core/...`).' },
  { group: ['@mitcsutt/kiln-ui/*'], message: 'Import @mitcsutt/kiln-ui from its barrel.' },
  { group: ['@dnd-kit/*'], message: DND_ENGINE },
]

// apps/demo/AGENTS.md: the demo proves the packages are enough to build an app, so it has no
// styling of its own and reaches each package through its public entries only.
const DEMO_NO_STYLING =
  'The demo has no styling of its own: compose Kiln components through their props (apps/demo/AGENTS.md).'

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
    // The built demo app, copied in for the static export.
    'apps/docs/public/demo-app/',
    // Written by TanStack Router's generator.
    'apps/demo/src/routeTree.gen.ts',
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
    // The `./dnd` entry, and the tests that stub what jsdom lacks for it, may import kiln-dnd.
    name: 'kiln/workspace/forms/dnd',
    files: [
      'packages/forms/src/dnd/**',
      'packages/forms/src/**/*.test.{ts,tsx}',
      'packages/forms/src/test/**',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: FORMS_IMPORT_PATTERNS.filter((pattern) => pattern.message !== FORMS_DND) },
      ],
    },
  },
  {
    name: 'kiln/workspace/dnd',
    files: ['packages/dnd/src/**'],
    extends: [react, storybook],
    rules: {
      // `GridLayout.Item` is a compound part, as in ui (ADR 0015).
      'react-refresh/only-export-components': 'off',
      // `role="list"` on a `list-style: none` list is deliberate: Safari drops list
      // semantics without it.
      'jsx-a11y/no-redundant-roles': ['error', { nav: ['navigation'], ul: ['list'], ol: ['list'] }],
      // A list item dragged without a handle is itself the drag control: it takes focus
      // and points to the keyboard instructions (packages/dnd/AGENTS.md).
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: [], allowExpressionValues: true },
      ],
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: DND_IMPORT_PATTERNS }],
    },
  },
  {
    // Vendored from react-grid-layout 2.3.0 and kept as written there (index-based loops
    // and all), so a diff against the upstream source stays readable.
    name: 'kiln/workspace/dnd/vendored',
    files: ['packages/dnd/src/grid/engine/*.ts'],
    ignores: ['packages/dnd/src/grid/engine/*.test.ts'],
    rules: {
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
    },
  },
  {
    name: 'kiln/workspace/dnd/engine',
    files: ['packages/dnd/src/core/engine.ts', 'packages/dnd/src/core/engine.test.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: DND_IMPORT_PATTERNS.filter((pattern) => pattern.message !== DND_ENGINE) },
      ],
    },
  },
  {
    name: 'kiln/workspace/charts',
    files: ['packages/charts/src/**'],
    extends: [react, storybook],
    rules: {
      // Compound charts (`Chart.Bar`) follow the ui authoring standard, so the rule is off
      // here for the same reason as in ui (ADR 0015).
      'react-refresh/only-export-components': 'off',
      // `role="list"` on a `list-style: none` list is deliberate: Safari drops list
      // semantics without it.
      'jsx-a11y/no-redundant-roles': ['error', { nav: ['navigation'], ul: ['list'], ol: ['list'] }],
      // A heatmap is a grid of cells: the focused cell is the one tab stop (roving tabindex).
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { roles: ['gridcell'], allowExpressionValues: true },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../*'], message: 'Import with a `#` subpath import (`#core/...`).' },
            {
              group: ['@mitcsutt/kiln-ui/*'],
              message: 'Import @mitcsutt/kiln-ui from its barrel.',
            },
          ],
        },
      ],
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
    // The demo app: a React app laid out by kiln-structure (ADR 0037, ADR 0046).
    name: 'kiln/workspace/demo',
    files: ['apps/demo/**'],
    extends: [react],
    rules: {
      // A private app ships nothing to npm, so everything it uses is a dev dependency.
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, peerDependencies: true, optionalDependencies: false },
      ],
    },
  },
  {
    name: 'kiln/workspace/demo/src',
    files: ['apps/demo/src/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "JSXAttribute[name.name='style']", message: DEMO_NO_STYLING },
        { selector: "JSXAttribute[name.name='className']", message: DEMO_NO_STYLING },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mitcsutt/kiln-*/src/*', '@mitcsutt/kiln-*/testing'],
              message: 'Import Kiln packages from the public entries an app uses.',
            },
            { group: ['*.module.css'], message: DEMO_NO_STYLING },
            { group: ['@tanstack/react-form'], message: 'Import it from @mitcsutt/kiln-forms.' },
          ],
        },
      ],
    },
  },
  ...kilnStructure({
    srcDir: 'apps/demo/src',
    rootDir: import.meta.dirname,
    features: {
      overview: ['studio', 'books', 'firings', 'community'],
      studio: [],
      books: [],
      firings: [],
      community: [],
    },
    groups: { components: ['sections'] },
  }),
  {
    // TanStack Router reads the `Route` export from each route file, beside its component.
    name: 'kiln/workspace/demo/routes',
    files: ['apps/demo/src/routes/**'],
    rules: {
      // TanStack's autoCodeSplitting splits each route's component out for HMR.
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    name: 'kiln/workspace/demo/node',
    files: ['apps/demo/*.ts', 'apps/demo/scripts/**'],
    extends: [node],
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
      'packages/charts/src/test/**',
      'packages/forms/src/test/**',
      'packages/forms/src/stories/**',
      'packages/forms/src/**/*.test-d.{ts,tsx}',
      'packages/dnd/src/test/**',
      'packages/dnd/src/stories/**',
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
      'packages/charts/src/**/*.test.{ts,tsx}',
      'packages/charts/src/test/**',
      // Forms tests and their harness read the same contract through kiln-ui, plus what
      // a form submits: hidden inputs and `name`s for FormData, and the wrapper that
      // carries `aria-describedby` on a group field (ADR 0017).
      'packages/forms/src/**/*.test.{ts,tsx}',
      'packages/forms/src/test/**',
      // kiln-dnd tests assert on the data attributes its CSS and themes style (the drop
      // edge, the drag input) and read its live region.
      'packages/dnd/src/**/*.test.{ts,tsx}',
      'packages/dnd/src/test/**',
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
    files: ['packages/forms/src/**/*.test.{ts,tsx}', 'packages/charts/src/**/*.test.{ts,tsx}'],
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
