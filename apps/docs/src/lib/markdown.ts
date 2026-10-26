import { site } from './site'
import { source, type DocsPageType } from './source'
import { toMarkdown } from './to-markdown'

export async function pageMarkdown(page: DocsPageType): Promise<string> {
  const body = toMarkdown(await page.data.getText('processed'))
  const header = [`# ${page.data.title}`, '']
  if (page.data.description) header.push(`> ${page.data.description}`, '')
  header.push(`Source: ${site.url}${page.url}`, '')
  return `${header.join('\n')}\n${body.trim()}\n`
}

/** `llms.txt`: what the site is, then every page as a link to its Markdown, grouped by section. */
export function llmsIndex(): string {
  const { intro, sections } = site.markdown.llms
  const lines = [
    `# ${site.name}`,
    '',
    `> ${intro}`,
    '',
    `Every page below is Markdown. The whole site in one file: ${site.url}/llms-full.txt`,
  ]
  const groups = new Map<string, DocsPageType[]>()
  for (const page of source.getPages()) {
    const section = page.slugs[0] ?? ''
    const list = groups.get(section) ?? []
    list.push(page)
    groups.set(section, list)
  }
  const titles: Readonly<Record<string, string | undefined>> = sections
  for (const [section, pages] of groups) {
    lines.push('', `## ${titles[section] ?? section}`, '')
    for (const page of pages) {
      const description = page.data.description ? `: ${page.data.description}` : ''
      lines.push(`- [${page.data.title}](${site.url}${page.url}.md)${description}`)
    }
  }
  return `${lines.join('\n')}\n`
}

export async function llmsFull(): Promise<string> {
  const pages = await Promise.all(source.getPages().map(pageMarkdown))
  return pages.join('\n---\n\n')
}
