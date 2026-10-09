/**
 * Variant blocks (ADR 0038): stack-specific content on one docs page, written as
 * `<Variant router="next">…</Variant>` or `<Variant data="graphql">…</Variant>`. The site shows
 * one value of an axis at a time, the Markdown shows every value labelled, and the skills
 * builder strips them from a core skill and gathers one value's blocks into an add-on.
 *
 * An axis is a prop name. Adding one, or a value, is an entry here.
 */
export const VARIANT_AXES = {
  router: {
    label: 'Router',
    values: { tanstack: 'TanStack Router', next: 'Next.js' },
  },
  data: {
    label: 'Data',
    values: {
      'tanstack-query': 'TanStack Query',
      graphql: 'GraphQL',
      rest: 'REST',
      websockets: 'WebSockets',
    },
  },
} as const satisfies Record<string, { label: string; values: Record<string, string> }>

export type VariantAxis = keyof typeof VARIANT_AXES

export interface VariantKey {
  axis: VariantAxis
  value: string
}

export function isVariantAxis(name: string): name is VariantAxis {
  return Object.hasOwn(VARIANT_AXES, name)
}

/** The values of an axis, in order. The first is the default. */
export function variantValues(axis: VariantAxis): string[] {
  return Object.keys(VARIANT_AXES[axis].values)
}

export function variantLabel({ axis, value }: VariantKey): string {
  const label = (VARIANT_AXES[axis].values as Record<string, string | undefined>)[value]
  if (label === undefined) throw new Error(`<Variant ${axis}="${value}"> isn't a known value`)
  return label
}

/** The one axis and value a `<Variant>` names in its props. Throws unless it's exactly one. */
export function variantOf(props: Record<string, unknown>): VariantKey {
  const named = Object.entries(props).filter(
    (entry): entry is [VariantAxis, string] =>
      isVariantAxis(entry[0]) && typeof entry[1] === 'string',
  )
  const [first] = named
  if (named.length !== 1 || !first) {
    throw new Error(
      `A <Variant> names exactly one of ${Object.keys(VARIANT_AXES).join(', ')}, as a string`,
    )
  }
  const key = { axis: first[0], value: first[1] }
  variantLabel(key)
  return key
}

/** A stretch of Markdown: page text, or the inside of one `<Variant>` block. */
export interface VariantSegment {
  text: string
  variant?: VariantKey
}

const OPENING = /^(\s*)<Variant\s+(\w+)="([^"]*)"\s*>\s*$/
const CLOSING = /^\s*<\/Variant>\s*$/
const FENCE = /^\s{0,3}(`{3,}|~{3,})/

/** Removes the indentation every non-blank line shares (the processed Markdown indents JSX children). */
function dedent(lines: string[]): string {
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => /^ */.exec(line)?.[0].length ?? 0)
  const shared = indents.length ? Math.min(...indents) : 0
  return lines
    .map((line) => line.slice(shared))
    .join('\n')
    .trim()
}

/**
 * Splits Markdown or MDX into page text and `<Variant>` blocks. The tags sit on lines of their
 * own, outside code; a block doesn't nest and holds no heading.
 */
export function splitVariants(markdown: string): VariantSegment[] {
  const segments: VariantSegment[] = []
  let text: string[] = []
  let block: { variant: VariantKey; lines: string[] } | undefined
  let fence: string | undefined

  for (const line of markdown.split('\n')) {
    const marker = FENCE.exec(line)?.[1]
    if (fence) {
      if (marker?.startsWith(fence.charAt(0)) && marker.length >= fence.length) fence = undefined
      ;(block ? block.lines : text).push(line)
      continue
    }
    if (marker) fence = marker
    const opening = fence ? null : OPENING.exec(line)
    if (opening) {
      if (block) throw new Error('A <Variant> block is open already: they never nest')
      const [, , axis = '', value = ''] = opening
      if (!isVariantAxis(axis)) throw new Error(`<Variant ${axis}="${value}"> isn't a known axis`)
      const variant = { axis, value }
      variantLabel(variant)
      segments.push({ text: text.join('\n') })
      text = []
      block = { variant, lines: [] }
      continue
    }
    if (!fence && CLOSING.test(line)) {
      if (!block) throw new Error('</Variant> closes no block')
      const body = dedent(block.lines)
      if (/^#{1,6}\s/m.test(body.replace(/^(`{3,}|~{3,})[\s\S]*?^\1/gm, ''))) {
        throw new Error(`A <Variant> block holds no heading: ${body.slice(0, 60)}`)
      }
      segments.push({ text: body, variant: block.variant })
      block = undefined
      continue
    }
    ;(block ? block.lines : text).push(line)
  }
  if (block)
    throw new Error(`<Variant ${block.variant.axis}="${block.variant.value}"> isn't closed`)
  segments.push({ text: text.join('\n') })
  return segments.filter((segment) => segment.variant !== undefined || segment.text.trim() !== '')
}

/**
 * Consecutive blocks of one axis, with only blank lines between them: what the site shows as one
 * switch. Each run must cover every value of its axis once, so a reader who picks a value always
 * sees something.
 */
export function variantRuns(markdown: string): VariantKey[][] {
  const runs: VariantKey[][] = []
  let current: VariantKey[] | undefined
  for (const segment of splitVariants(markdown)) {
    if (!segment.variant) {
      if (segment.text.trim()) current = undefined
      continue
    }
    if (current?.[0]?.axis === segment.variant.axis) current.push(segment.variant)
    else runs.push((current = [segment.variant]))
  }
  return runs
}

export type VariantSelection = 'all' | 'none' | VariantKey

const isHeading = (line: string) => /^#{1,6}\s/.test(line)

/** Drops headings left with nothing under them before the next heading of their level or higher. */
function dropEmptyHeadings(markdown: string): string {
  const lines = markdown.split('\n')
  const level = (line: string) => /^(#{1,6})\s/.exec(line)?.[1]?.length ?? 0
  const kept = lines.filter((line, index) => {
    if (!isHeading(line)) return true
    const next = lines.slice(index + 1).find((candidate) => candidate.trim())
    return next !== undefined && !(isHeading(next) && level(next) <= level(line))
  })
  return kept.join('\n')
}

/**
 * The page's Markdown with its variant blocks resolved:
 *
 * - `all`: every block, each under a bold label naming its stack (the `.md` routes, llms-full.txt);
 * - `none`: no blocks, and no heading they leave empty (a core skill);
 * - one axis value: only that value's blocks, each under the nearest heading above it (an add-on).
 */
export function resolveVariants(markdown: string, selection: VariantSelection): string {
  const segments = splitVariants(markdown)
  if (!segments.some((segment) => segment.variant)) return markdown

  if (selection === 'all') {
    return segments
      .map((segment) =>
        segment.variant
          ? `\n**${VARIANT_AXES[segment.variant.axis].label}: ${variantLabel(segment.variant)}**\n\n${segment.text}\n`
          : segment.text,
      )
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
  }
  if (selection === 'none') {
    const text = segments
      .filter((segment) => !segment.variant)
      .map((segment) => segment.text)
      .join('\n')
    return dropEmptyHeadings(text).replace(/\n{3,}/g, '\n\n')
  }

  const parts: string[] = []
  let heading: string | undefined
  let shown: string | undefined
  for (const segment of segments) {
    if (!segment.variant) {
      const headings = segment.text.split('\n').filter(isHeading)
      heading = headings.at(-1) ?? heading
      continue
    }
    if (segment.variant.axis !== selection.axis || segment.variant.value !== selection.value) {
      continue
    }
    if (heading && heading !== shown) parts.push(heading)
    shown = heading
    parts.push(segment.text)
  }
  return parts.join('\n\n')
}
