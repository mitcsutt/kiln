import { defineSite } from '@mitcsutt/kiln-docs/config'

const repository = 'https://github.com/mitcsutt/kiln'

/**
 * kiln-ui's built-in themes, as its `THEMES` lists them. The config is Node-loadable (ADR 0045),
 * and kiln-ui's root entry, which exports `THEMES`, imports CSS, so they're written out here;
 * `src/test/site-config.test.ts` fails when they differ from `THEMES`.
 */
const THEMES = ['paper', 'monograph', 'ledger', 'fiesta', 'flightdeck', 'riso']

/** What makes the docs site Kiln's (`SiteConfig` in `@mitcsutt/kiln-docs/config` describes each key). */
export default defineSite({
  name: 'Kiln',
  description:
    'Kiln is a themeable React design system, a form library, and the ESLint, Prettier and TypeScript configs they are built with.',
  // Where the site is deployed from `main` (ADR 0034).
  url: 'https://kiln.mitchellsutton.com',
  repository: { url: repository },
  // Every page is a preview of every theme. Harbour, the Theming guide's custom theme, is styled
  // but not offered.
  theme: { picker: THEMES, default: 'paper' },
  nav: {
    sections: [
      { href: '/docs/ui', label: 'UI' },
      { href: '/docs/forms', label: 'Forms' },
      { href: '/docs/drag-and-drop', label: 'Drag and drop' },
      { href: '/docs/charts', label: 'Charts' },
      { href: '/docs/tooling', label: 'Tooling' },
    ],
    labels: { sections: 'Packages' },
  },
  footer: {
    text: 'Kiln is MIT licensed. Nothing here is published to npm yet.',
    links: [
      { href: repository, label: 'Source on GitHub' },
      { href: '/llms.txt', label: 'llms.txt' },
    ],
  },
  search: { placeholder: 'Button, FormSteps, tokens…' },
  notFound: {
    description:
      'It may have moved when the docs were reorganised. Search from the header, or start from the UI docs.',
    action: { href: '/docs/ui', label: 'Open the UI docs' },
  },
  markdown: {
    llms: {
      intro:
        'Kiln is a themeable React design system (`@mitcsutt/kiln-ui`), a form library on TanStack Form (`@mitcsutt/kiln-forms`), a drag-and-drop library for sortable lists, boards and grid layouts (`@mitcsutt/kiln-dnd`), themed charts (`@mitcsutt/kiln-charts`), and the ESLint, Prettier and TypeScript configs they are built with. Components render through design tokens; a theme is one CSS file.',
      sections: {
        '': 'Start here',
        ui: 'UI',
        forms: 'Forms',
        'drag-and-drop': 'Drag and drop',
        charts: 'Charts',
        tooling: 'Tooling',
      },
    },
  },
  variants: {
    router: {
      label: 'Router',
      values: { tanstack: 'TanStack Router', next: 'Next.js' },
    },
    data: {
      label: 'Data',
      values: {
        'tanstack-query': 'TanStack Query',
        graphql: 'GraphQL',
        rest: 'REST',
        websockets: 'WebSockets',
      },
    },
  },
})
