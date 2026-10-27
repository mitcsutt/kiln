import type { Metadata, MetadataRoute } from 'next'
import type { SiteConfig } from './config.ts'

/**
 * SEO basics, all from `site.url` (ADR 0045): `metadataBase`, canonical links, `sitemap.xml`,
 * `robots.txt` and basic Open Graph tags. URLs are written in full, as the Markdown's are, so they
 * hold for a site deployed under a path too.
 */

type SeoConfig = Pick<SiteConfig, 'name' | 'description' | 'url'>

interface SeoPage {
  url: string
  data: { title?: string; description?: string }
}

/** The root layout's metadata, which every page starts from. */
export function rootMetadata(config: SeoConfig): Metadata {
  return {
    metadataBase: new URL(config.url),
    title: { default: config.name, template: `%s · ${config.name}` },
    description: config.description,
    openGraph: {
      type: 'website',
      siteName: config.name,
      title: config.name,
      description: config.description,
    },
    twitter: { card: 'summary' },
  }
}

/**
 * A docs page's metadata: its title and description, its canonical URL, its Markdown as an
 * alternate, and its Open Graph tags. A page titled with the site's name, such as a docs index, is
 * titled with the name alone, not `<name> · <name>`.
 */
export function pageMetadata(config: SeoConfig, page: SeoPage): Metadata {
  const { title, description } = page.data
  const url = `${config.url}${page.url}`
  return {
    title: title === config.name ? { absolute: config.name } : title,
    description,
    alternates: { canonical: url, types: { 'text/markdown': `${url}.md` } },
    openGraph: {
      type: 'article',
      siteName: config.name,
      url,
      title,
      ...(description ? { description } : {}),
    },
  }
}

/** `sitemap.xml`: the landing page and every docs page. */
export function sitemap(config: SeoConfig, pages: readonly SeoPage[]): MetadataRoute.Sitemap {
  return [{ url: `${config.url}/` }, ...pages.map((page) => ({ url: `${config.url}${page.url}` }))]
}

/** `robots.txt`: everything may be crawled, and the sitemap is named. */
export function robots(config: SeoConfig): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${config.url}/sitemap.xml`,
  }
}
