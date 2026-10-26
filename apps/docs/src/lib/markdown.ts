import { site } from './site'
import type { DocsPageType } from './source'

/**
 * The `markdown.transform` hook: turns a page's processed Markdown into the body served at
 * `/docs/<page>.md` and in `llms-full.txt`. A site runs its own steps in it, in its own order,
 * for what its MDX components mean in Markdown. Kiln's is `toMarkdown`, given in
 * `siteMarkdown.ts`. It isn't in `site.config.ts`, which client components read: its steps
 * import the generated API, token and example data.
 */
export type MarkdownTransform = (processed: string, page: DocsPageType) => string

export interface MarkdownOptions {
  /** The site's pages, from its loader, in their defined order. */
  source: { getPages: () => DocsPageType[] }
  /** Leaves the processed Markdown as it is when not given. */
  transform?: MarkdownTransform
}

export interface SiteMarkdown {
  /** A page's Markdown: its title, description and URL, then its body. */
  page: (page: DocsPageType) => Promise<string>
  /** `llms.txt`: what the site is, then every page as a link to its Markdown, grouped by section. */
  llmsIndex: () => string
  /** `llms-full.txt`: every page's Markdown. */
  llmsFull: () => Promise<string>
}

export function createMarkdown({
  source,
  transform = (processed) => processed,
}: MarkdownOptions): SiteMarkdown {
  async function page(page: DocsPageType): Promise<string> {
    const body = transform(await page.data.getText('processed'), page)
    const header = [`# ${page.data.title}`, '']
    if (page.data.description) header.push(`> ${page.data.description}`, '')
    header.push(`Source: ${site.url}${page.url}`, '')
    return `${header.join('\n')}\n${body.trim()}\n`
  }

  function llmsIndex(): string {
    const { intro, sections } = site.markdown.llms
    const lines = [
      `# ${site.name}`,
      '',
      `> ${intro}`,
      '',
      `Every page below is Markdown. The whole site in one file: ${site.url}/llms-full.txt`,
    ]
    const groups = new Map<string, DocsPageType[]>()
    for (const entry of source.getPages()) {
      const section = entry.slugs[0] ?? ''
      const list = groups.get(section) ?? []
      list.push(entry)
      groups.set(section, list)
    }
    const titles: Readonly<Record<string, string | undefined>> = sections
    for (const [section, pages] of groups) {
      lines.push('', `## ${titles[section] ?? section}`, '')
      for (const entry of pages) {
        const description = entry.data.description ? `: ${entry.data.description}` : ''
        lines.push(`- [${entry.data.title}](${site.url}${entry.url}.md)${description}`)
      }
    }
    return `${lines.join('\n')}\n`
  }

  async function llmsFull(): Promise<string> {
    const pages = await Promise.all(source.getPages().map(page))
    return pages.join('\n---\n\n')
  }

  return { page, llmsIndex, llmsFull }
}
