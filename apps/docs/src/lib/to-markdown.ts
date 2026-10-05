import tokens from '../../.generated/tokens.json'
import { getApi, type ApiEntry } from './api'
import { exampleId, getExampleSource } from './examples'

function attribute(tag: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1]
}

/** Applies `edit` to the Markdown outside fenced code blocks. */
export function outsideCode(markdown: string, edit: (text: string) => string): string {
  return markdown
    .split(/(^```[\s\S]*?^```)/m)
    .map((part, index) => (index % 2 ? part : edit(part)))
    .join('')
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
  // Code is left as written: a JSX comment or self-closing element in an example is code.
  const expanded = outsideCode(processed, (text) =>
    text
      .replace(/<Example\b[^>]*\/>/g, (tag) => {
        const id = exampleId({ of: attribute(tag, 'of'), name: attribute(tag, 'name') })
        return `\`\`\`tsx\n${getExampleSource(id).trimEnd()}\n\`\`\``
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
      ),
  )
  return outsideCode(expanded, (text) =>
    text
      // MDX comments, such as a generated page's header, are for whoever edits the source.
      .replace(/\{\/\*[\s\S]*?\*\/\}\n*/g, '')
      // Visual specimens (colour swatches, the type scale, theme previews) have no Markdown form.
      .replace(/<[A-Z]\w*\b[^>]*\/>\n?/g, ''),
  )
}
