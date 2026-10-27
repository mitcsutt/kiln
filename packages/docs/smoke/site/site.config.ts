import { defineSite } from '@mitcsutt/kiln-docs/config'

const repository = 'https://github.com/example/smoke-toolbelt'

/** A toolbelt-shaped site: one fixed theme, the mode toggle, no picker (ADR 0046). */
export default defineSite({
  name: 'Smoke Toolbelt',
  description: 'Plugins for an agent, documented by a site built on @mitcsutt/kiln-docs.',
  url: 'https://smoke.example.com',
  repository: { url: repository },
  theme: { fixed: 'flightdeck' },
  nav: { sections: [] },
  footer: {
    text: 'MIT licensed.',
    links: [
      { href: repository, label: 'Source' },
      { href: '/llms.txt', label: 'llms.txt' },
    ],
  },
  search: { placeholder: 'Search plugins' },
  notFound: {
    description: 'That page isn’t here. Start from the docs.',
    action: { href: '/docs', label: 'Open the docs' },
  },
  markdown: {
    llms: {
      intro: 'Smoke Toolbelt is a kit of plugins for an agent.',
      sections: { '': 'Start here', guides: 'Guides', plugins: 'Plugins' },
    },
  },
  variants: {},
})
