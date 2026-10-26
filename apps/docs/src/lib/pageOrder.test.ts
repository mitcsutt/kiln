import { loader } from 'fumadocs-core/source'
import { withPageOrder } from './pageOrder'

const page = (path: string) => ({ type: 'page' as const, path, data: { title: path } })

/** Paths as the loader's `getPages()` returns them. */
const paths = (pages: { path: string }[]) => pages.map((entry) => entry.path)

// The defined order is what one collection gives today: llms.txt, llms-full.txt and the search
// index list pages in it, and a change to it changes all three.
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

  it('merges the pages of several collections into one order', () => {
    const generated = ORDERED.filter((_, index) => index % 2 === 0)
    const content = ORDERED.filter((_, index) => index % 2 === 1)
    const source = withPageOrder(
      loader({
        baseUrl: '/docs',
        source: {
          generated: { files: generated.map(page) },
          content: { files: content.map(page) },
        },
      }),
    )
    expect(paths(source.getPages())).toEqual(ORDERED)
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
