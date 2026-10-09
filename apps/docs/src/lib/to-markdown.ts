import tokens from '../../.generated/tokens.json'
import { getApi, type ApiEntry } from './api'
import { exampleId, examplesMarkdown, getExampleSource } from './examples'
import { dedent, resolveVariants, type VariantSelection } from './variants'

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

const FENCE = /^\s{0,3}(`{3,}|~{3,})/

/**
 * `<DecisionPair>` and its two `<Choice title chosen={true}>` blocks, as numbered options: the chosen
 * one says so. The processed Markdown indents the blocks' children, so each is dedented, and it
 * writes `chosen={true}` as `chosen="true"` and drops a bare `chosen`, so pages write `chosen={true}`.
 */
export function decisionsMarkdown(markdown: string): string {
  const out: string[] = []
  let choice: { title: string; chosen: boolean; lines: string[] } | undefined
  let number = 0
  let fence: string | undefined
  for (const line of markdown.split('\n')) {
    const marker = FENCE.exec(line)?.[1]
    if (fence ?? marker) {
      if (fence && marker?.startsWith(fence.charAt(0)) && marker.length >= fence.length) {
        fence = undefined
      } else {
        fence ??= marker
      }
      ;(choice ? choice.lines : out).push(line)
      continue
    }
    if (/^\s*<DecisionPair>\s*$/.test(line)) {
      number = 0
      continue
    }
    if (/^\s*<\/DecisionPair>\s*$/.test(line)) continue
    const opening = /^\s*<Choice\s+title="([^"]*)"(\s+chosen(?:=\{true\}|="true")?)?\s*>\s*$/.exec(
      line,
    )
    if (opening) {
      choice = { title: opening[1] ?? '', chosen: Boolean(opening[2]), lines: [] }
      continue
    }
    if (choice && /^\s*<\/Choice>\s*$/.test(line)) {
      number++
      const mark = choice.chosen ? ' (chosen)' : ''
      out.push(`**${String(number)}. ${choice.title}**${mark}`, '', dedent(choice.lines), '')
      choice = undefined
      continue
    }
    ;(choice ? choice.lines : out).push(line)
  }
  return out.join('\n')
}

/**
 * The page's MDX, made plain Markdown for agents: each live example becomes its source
 * and each API table becomes a Markdown table, read from the same data the page renders.
 * `variants` picks which `<Variant>` blocks stay (ADR 0038): every one, labelled, by default.
 */
export function toMarkdown(processed: string, variants: VariantSelection = 'all'): string {
  // Variant blocks first: they hold fenced code, which the edits below split the text around.
  const resolved = decisionsMarkdown(resolveVariants(processed, variants))
  // `<Examples of>` next: it stands for headings, captions and `<Example>` tags. The site's
  // processed Markdown has it expanded already; a page read from disk (the skills) doesn't.
  const listed = outsideCode(resolved, (text) =>
    text.replace(/<Examples\b[^>]*\/>/g, (tag) => examplesMarkdown(attribute(tag, 'of') ?? '')),
  )
  // Code is left as written: a JSX comment or self-closing element in an example is code.
  const expanded = outsideCode(listed, (text) =>
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
