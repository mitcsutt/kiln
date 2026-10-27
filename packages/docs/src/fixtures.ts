import type { StaticSource } from 'fumadocs-core/source'
import { defineSite } from './config.ts'

/** A whole site config, toolbelt-shaped, for the tests. */
export const testConfig = defineSite({
  name: 'Toolbelt',
  description: 'Claude Code plugins.',
  url: 'https://toolbelt.example.com',
  repository: { url: 'https://github.com/example/toolbelt' },
  theme: { picker: ['paper'], default: 'paper' },
  nav: { sections: [] },
  footer: { text: 'MIT licensed.', links: [] },
  search: { placeholder: 'Search' },
  notFound: { description: 'Not here.', action: { href: '/docs', label: 'Docs' } },
  markdown: { llms: { intro: 'Plugins.', sections: { '': 'Start here', plugins: 'Plugins' } } },
  variants: {},
})

export const page = (path: string, title = path, data: Record<string, unknown> = {}) => ({
  type: 'page' as const,
  path,
  data: { title, ...data },
})

export const meta = (path: string, data: Record<string, unknown>) => ({
  type: 'meta' as const,
  path,
  data,
})

export type TestFile = ReturnType<typeof page> | ReturnType<typeof meta>

/** A collection as `fumadocs-mdx:collections/server` gives one, over these files. */
export const collection = (...files: TestFile[]) => ({
  toFumadocsSource: (): StaticSource => ({ files }),
})
