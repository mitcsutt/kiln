import { pageUrl, toSearchResults, type PagefindPage } from './pagefind.ts'

/** A result's data as Pagefind 1.5 gives it for Kiln's Button page, cut down. */
const button: PagefindPage = {
  url: '/docs/ui/actions/button.html',
  excerpt: '<mark>Button.</mark> The way to act.',
  meta: { title: 'Button', crumbs: 'UI / Actions' },
  sub_results: [
    {
      title: 'Button',
      url: '/docs/ui/actions/button.html',
      excerpt: '<mark>Button.</mark> The way to act.',
    },
    {
      title: 'Tones',
      url: '/docs/ui/actions/button.html#tones',
      excerpt: '<mark>&lt;Button</mark> tone=&quot;critical&quot;&gt;Delete &amp; leave',
    },
  ],
}

describe('Pagefind results', () => {
  it('link to the page without the export file’s extension', () => {
    expect(pageUrl('/docs/ui/actions/button.html')).toBe('/docs/ui/actions/button')
    expect(pageUrl('/docs/ui/actions/button.html#tones')).toBe('/docs/ui/actions/button#tones')
    expect(pageUrl('/docs.html')).toBe('/docs')
  })

  it("list each page with its breadcrumb, then its sections, as the Orama index's do", () => {
    expect(toSearchResults([button])).toEqual([
      {
        id: '/docs/ui/actions/button',
        url: '/docs/ui/actions/button',
        type: 'page',
        content: 'Button',
        breadcrumbs: ['UI', 'Actions'],
      },
      {
        id: '/docs/ui/actions/button:/docs/ui/actions/button',
        url: '/docs/ui/actions/button',
        type: 'text',
        content: '<mark>Button.</mark> The way to act.',
      },
      {
        id: '/docs/ui/actions/button:/docs/ui/actions/button#tones',
        url: '/docs/ui/actions/button#tones',
        type: 'text',
        // The header renders text, so the page's own `<` and `&` come back from their entities.
        content: '<mark><Button</mark> tone="critical">Delete & leave',
      },
    ])
  })

  it('show the page’s excerpt when it has no sections, and no breadcrumb when it has none', () => {
    const index = { ...button, url: '/docs.html', meta: { title: 'Toolbelt' }, sub_results: [] }
    expect(toSearchResults([index])).toEqual([
      { id: '/docs', url: '/docs', type: 'page', content: 'Toolbelt' },
      {
        id: '/docs:/docs',
        url: '/docs',
        type: 'text',
        content: '<mark>Button.</mark> The way to act.',
      },
    ])
  })
})
