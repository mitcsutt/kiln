import tokens from '../../.generated/tokens.json'
import { getApi, type ApiEntry } from './api'
import { getExampleSource } from './examples'
import { SITE_URL } from './site'
import { source, type DocsPageType } from './source'

function attribute(tag: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1]
}

function cell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n+/g, ' ')
}

export function apiMarkdown(entry: ApiEntry): string {
  const lines: string[] = []
  if (entry.props?.length) {
    lines.push(
      `\`${entry.name}\`:`,
      '',
      '| Prop | Type | Default | Description |',
      '| --- | --- | --- | --- |',
    )
    for (const prop of entry.props) {
      const name = `\`${prop.name}\`${prop.required ? ' (required)' : ''}`
      const fallback = prop.default ? `\`${prop.default}\`` : ''
      lines.push(`| ${name} | \`${cell(prop.type)}\` | ${fallback} | ${cell(prop.description)} |`)
    }
  }
  if (entry.extends?.length) {
    lines.push(
      '',
      `${entry.props?.length ? 'Also accepts' : 'Accepts'} every prop of ${entry.extends.map((t) => `\`${t}\``).join(' and ')}.`,
    )
  }
  return lines.join('\n')
}

/**
 * The page's MDX, made plain Markdown for agents: each live example becomes its source
 * and each API table becomes a Markdown table, read from the same data the page renders.
 */
export function toMarkdown(processed: string): string {
  return (
    processed
      .replace(/<Example\b[^>]*\/>/g, (tag) => {
        const name = attribute(tag, 'name')
        return name ? `\`\`\`tsx\n${getExampleSource(name).trimEnd()}\n\`\`\`` : ''
      })
      .replace(/<ApiTable\b[^>]*\/>/g, (tag) =>
        (attribute(tag, 'of') ?? '')
          .split(',')
          .map((name) => apiMarkdown(getApi(name.trim())))
          .join('\n\n'),
      )
      .replace(/<ApiSignature\b[^>]*\/>/g, (tag) => {
        const entry = getApi(attribute(tag, 'of') ?? '')
        const code = `\`\`\`ts\n${entry.signature ?? entry.name}\n\`\`\``
        return entry.description ? `${code}\n\n${entry.description}` : code
      })
      .replace(/<ContractTokens\s*\/>/g, () =>
        tokens.groups
          .map((group) =>
            [
              `${group.title}:`,
              '',
              '| Token | Paper |',
              '| --- | --- |',
              ...group.tokens.map((token) => `| \`${token.name}\` | \`${cell(token.value)}\` |`),
            ].join('\n'),
          )
          .join('\n\n'),
      )
      .replace(/<ComponentTokens\b[^>]*\/>/g, (tag) => {
        const list = (
          tokens.components as Record<string, { name: string; description: string }[] | undefined>
        )[attribute(tag, 'of') ?? '']
        return list
          ? [
              '| Token | Default and use |',
              '| --- | --- |',
              ...list.map((t) => `| \`${t.name}\` | ${cell(t.description)} |`),
            ].join('\n')
          : ''
      })
      .replace(/<OptionalThemeTokens\s*\/>/g, () =>
        tokens.optional.map((name) => `\`${name}\``).join(', '),
      )
      .replace(
        /<StarterThemeFile\s*\/>/g,
        () => `\`\`\`css\n${tokens.starterTheme.trimEnd()}\n\`\`\``,
      )
      .replace(
        /<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g,
        (_match, attrs: string, body: string) => {
          const title = attribute(attrs, 'title')
          const text = body
            .trim()
            .split('\n')
            .map((line) => `> ${line}`.trimEnd())
          return [title ? `> **${title}**` : null, title ? '>' : null, ...text]
            .filter(Boolean)
            .join('\n')
        },
      )
      // Visual specimens (colour swatches, the type scale, theme previews) have no Markdown form.
      .replace(/<[A-Z]\w*\b[^>]*\/>\n?/g, '')
  )
}

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
