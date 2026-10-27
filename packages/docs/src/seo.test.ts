import { pageMetadata, robots, rootMetadata, sitemap } from './seo.ts'

const config = {
  name: 'Toolbelt',
  description: 'Claude Code plugins.',
  url: 'https://toolbelt.example.com',
}

const page = (url: string, title: string, description?: string) => ({
  url,
  data: { title, description },
})

describe('SEO from site.url', () => {
  it('sets metadataBase, the title template and Open Graph basics at the root', () => {
    expect(rootMetadata(config)).toEqual({
      metadataBase: new URL('https://toolbelt.example.com'),
      title: { default: 'Toolbelt', template: '%s · Toolbelt' },
      description: 'Claude Code plugins.',
      openGraph: {
        type: 'website',
        siteName: 'Toolbelt',
        title: 'Toolbelt',
        description: 'Claude Code plugins.',
      },
      twitter: { card: 'summary' },
    })
  })

  it('fails on a site.url that is not a URL', () => {
    expect(() => rootMetadata({ ...config, url: 'toolbelt.example.com' })).toThrow()
  })

  it('gives a page its canonical URL, its Markdown and its Open Graph tags', () => {
    expect(pageMetadata(config, page('/docs/plugins/git', 'git', 'Git helpers.'))).toEqual({
      title: 'git',
      description: 'Git helpers.',
      alternates: {
        canonical: 'https://toolbelt.example.com/docs/plugins/git',
        types: { 'text/markdown': 'https://toolbelt.example.com/docs/plugins/git.md' },
      },
      openGraph: {
        type: 'article',
        siteName: 'Toolbelt',
        url: 'https://toolbelt.example.com/docs/plugins/git',
        title: 'git',
        description: 'Git helpers.',
      },
    })
  })

  it("leaves a page's description to the site's when it has none", () => {
    const metadata = pageMetadata(config, page('/docs/install', 'Install'))
    expect(metadata.description).toBeUndefined()
    expect(metadata.openGraph).not.toHaveProperty('description')
  })

  // ADR 0045: the docs index's title is the site's name alone, not `<name> · <name>`.
  it('titles a page named after the site with the name alone', () => {
    expect(pageMetadata(config, page('/docs', 'Toolbelt')).title).toEqual({ absolute: 'Toolbelt' })
    expect(pageMetadata(config, page('/docs', 'Introduction')).title).toBe('Introduction')
  })

  it('lists the landing page and every docs page in the sitemap', () => {
    expect(sitemap(config, [page('/docs', 'Toolbelt'), page('/docs/install', 'Install')])).toEqual([
      { url: 'https://toolbelt.example.com/' },
      { url: 'https://toolbelt.example.com/docs' },
      { url: 'https://toolbelt.example.com/docs/install' },
    ])
  })

  it('lets everything be crawled and names the sitemap in robots.txt', () => {
    expect(robots(config)).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://toolbelt.example.com/sitemap.xml',
    })
  })

  it('keeps a path in site.url', () => {
    const nested = { ...config, url: 'https://example.com/toolbelt' }
    expect(sitemap(nested, [page('/docs', 'Toolbelt')])).toEqual([
      { url: 'https://example.com/toolbelt/' },
      { url: 'https://example.com/toolbelt/docs' },
    ])
    expect(pageMetadata(nested, page('/docs', 'A')).alternates).toEqual({
      canonical: 'https://example.com/toolbelt/docs',
      types: { 'text/markdown': 'https://example.com/toolbelt/docs.md' },
    })
  })
})
