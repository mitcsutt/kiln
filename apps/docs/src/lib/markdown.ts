import { SITE_URL } from './site'
import { source, type DocsPageType } from './source'
import { toMarkdown } from './to-markdown'

export async function pageMarkdown(page: DocsPageType): Promise<string> {
  const body = toMarkdown(await page.data.getText('processed'))
  const header = [`# ${page.data.title}`, '']
  if (page.data.description) header.push(`> ${page.data.description}`, '')
  header.push(`Source: ${SITE_URL}${page.url}`, '')
  return `${header.join('\n')}\n${body.trim()}\n`
}

/** `llms.txt`: what Kiln is, then every page as a link to its Markdown, grouped by section. */
export function llmsIndex(): string {
  const lines = [
    '# Kiln',
    '',
    '> Kiln is a themeable React design system (`@mitcsutt/kiln-ui`), a form library on TanStack Form (`@mitcsutt/kiln-forms`), and the ESLint, Prettier and TypeScript configs they are built with. Components render through design tokens; a theme is one CSS file.',
    '',
    `Every page below is Markdown. The whole site in one file: ${SITE_URL}/llms-full.txt`,
  ]
  const groups = new Map<string, DocsPageType[]>()
  for (const page of source.getPages()) {
    const section = page.slugs[0] ?? 'kiln'
    const list = groups.get(section) ?? []
    list.push(page)
    groups.set(section, list)
  }
  const titles: Record<string, string> = {
    kiln: 'Start here',
    ui: 'UI',
    forms: 'Forms',
    tooling: 'Tooling',
  }
  for (const [section, pages] of groups) {
    lines.push('', `## ${titles[section] ?? section}`, '')
    for (const page of pages) {
      const description = page.data.description ? `: ${page.data.description}` : ''
      lines.push(`- [${page.data.title}](${SITE_URL}${page.url}.md)${description}`)
    }
  }
  return `${lines.join('\n')}\n`
}

export async function llmsFull(): Promise<string> {
  const pages = await Promise.all(source.getPages().map(pageMarkdown))
  return pages.join('\n---\n\n')
}
