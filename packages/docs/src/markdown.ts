import type { SiteConfig } from './config.ts'

/** What the Markdown routes read from a page. */
export interface MarkdownPage {
  /** Its file path inside its collection, for errors. */
  path: string
  url: string
  slugs: string[]
  data: { title?: string; description?: string }
}

/**
 * The `markdown.transform` hook: turns a page's processed Markdown into the body served at
 * `/docs/<page>.md` and in `llms-full.txt`. A site runs its own steps in it, in its own order, for
 * what its MDX components mean in Markdown. It isn't in `site.config.ts`, which client components
 * read, because its steps may import a site's build data.
 */
export type MarkdownTransform<Page extends MarkdownPage = MarkdownPage> = (
  processed: string,
  page: Page,
) => string

export interface SiteMarkdown<Page extends MarkdownPage = MarkdownPage> {
  /** A page's Markdown: `# <title>`, `> <description>`, `Source: <URL>`, then its body. */
  page: (page: Page) => Promise<string>
  /** `llms.txt`: what the site is, then every page as a link to its Markdown, by section. */
  llmsIndex: () => string
  /** `llms-full.txt`: every page's Markdown, joined by `---` lines. */
  llmsFull: () => Promise<string>
}

export interface MarkdownOptions<Page extends MarkdownPage> {
  config: Pick<SiteConfig, 'name' | 'url' | 'markdown'>
  /** The site's pages, in their defined order. */
  source: { getPages: () => Page[] }
  /** Leaves the processed Markdown as it is when not given. */
  transform?: MarkdownTransform<Page>
}

/**
 * A description on one line. A YAML block scalar (`description: |`) keeps its line breaks, which
 * would end an `llms.txt` list item or a `>` quote early. The block's indicator itself (`>-`) never
 * reaches here: frontmatter is read by Fumadocs' YAML parser, not line by line (ADR 0045, W8).
 */
export const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim()

/** The page's processed Markdown, which `defineDocsCollections` keeps for every page. */
async function processedOf(page: MarkdownPage): Promise<string> {
  const { getText } = page.data as { getText?: (type: 'processed') => Promise<string> }
  if (!getText) {
    throw new Error(
      `kiln-docs: ${page.path} has no processed Markdown. Define its collection with defineDocsCollections.`,
    )
  }
  return getText('processed')
}

/**
 * The site's Markdown for agents, in Kiln's format (ADR 0045), not Fumadocs' `llms()` helper.
 * `llms.txt` is `# <name>`, a `>` intro from config, a line pointing at the absolute
 * `llms-full.txt`, then a `## <section>` group per top-level folder, titled from
 * `markdown.llms.sections`, with each page as `- [<title>](<absolute URL>.md): <description>`.
 */
export function createMarkdown<Page extends MarkdownPage>({
  config,
  source,
  transform = (processed) => processed,
}: MarkdownOptions<Page>): SiteMarkdown<Page> {
  async function page(page: Page): Promise<string> {
    const body = transform(await processedOf(page), page)
    const header = [`# ${page.data.title ?? ''}`, '']
    if (page.data.description) header.push(`> ${oneLine(page.data.description)}`, '')
    header.push(`Source: ${config.url}${page.url}`, '')
    return `${header.join('\n')}\n${body.trim()}\n`
  }

  function llmsIndex(): string {
    const { intro, sections } = config.markdown.llms
    const lines = [
      `# ${config.name}`,
      '',
      `> ${intro}`,
      '',
      `Every page below is Markdown. The whole site in one file: ${config.url}/llms-full.txt`,
    ]
    const groups = new Map<string, Page[]>()
    for (const entry of source.getPages()) {
      const section = entry.slugs[0] ?? ''
      const list = groups.get(section) ?? []
      list.push(entry)
      groups.set(section, list)
    }
    const titles: Readonly<Record<string, string | undefined>> = sections
    for (const [section, pages] of groups) {
      lines.push('', `## ${titles[section] ?? (section || config.name)}`, '')
      for (const entry of pages) {
        const description = entry.data.description ? `: ${oneLine(entry.data.description)}` : ''
        lines.push(`- [${entry.data.title ?? ''}](${config.url}${entry.url}.md)${description}`)
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
