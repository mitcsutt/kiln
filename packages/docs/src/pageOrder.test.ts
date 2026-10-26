import { loader } from 'fumadocs-core/source'
import { withPageOrder } from './pageOrder.ts'

const page = (path: string) => ({ type: 'page' as const, path, data: { title: path } })

/** Paths as the loader's `getPages()` returns them. */
const paths = (pages: { path: string }[]) => pages.map((entry) => entry.path)

// The order Kiln's single collection gives today: llms.txt, llms-full.txt and the search index
// list pages in it, and a change to it changes all three.
const ORDERED = [
  'charts/getting-started/colour.mdx',
  'charts/index.mdx',
  'charts/presets/bars.mdx',
  'drag-and-drop/index.mdx',
  'forms/fields/text-field.mdx',
  'index.mdx',
  'ui/actions/button.mdx',
  'ui/foundations/design-rules.mdx',
  'ui/index.mdx',
]

describe('page order', () => {
  it('lists pages by file path, whatever order they were stored in', () => {
    const shuffled = [...ORDERED].reverse()
    const source = withPageOrder(
      loader({ baseUrl: '/docs', source: { files: shuffled.map(page) } }),
    )
    expect(paths(source.getPages())).toEqual(ORDERED)
  })

  it('compares by code unit, not by locale', () => {
    const source = withPageOrder(
      loader({ baseUrl: '/docs', source: { files: ['b.mdx', 'B.mdx', 'a.mdx'].map(page) } }),
    )
    expect(paths(source.getPages())).toEqual(['B.mdx', 'a.mdx', 'b.mdx'])
  })

  it('generates static params in the same order', () => {
    const source = withPageOrder(
      loader({ baseUrl: '/docs', source: { files: [...ORDERED].reverse().map(page) } }),
    )
    expect(source.generateParams().map((params) => params.slug.join('/'))).toEqual(
      source.getPages().map((entry) => entry.slugs.join('/')),
    )
  })
})
