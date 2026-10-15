/**
 * Option filtering for type-to-search controls (Combobox, CommandPalette). Not exported from the
 * package.
 *
 * Matching is case-insensitive and diacritic-folded ("cote" finds "Côte d'Ivoire",
 * "curacao" finds "Curaçao"). Results are ranked, and stable within a rank:
 *   0 — exact: the label or a keyword equals the query ("USA" → United States)
 *   1 — prefix: the label, a word in it, or a keyword starts with the query
 *   2 — substring: the label, a keyword or the description contains the query
 */

export interface FilterableOption {
  label: string
  keywords?: readonly string[]
  description?: string
}

/** Lower-case, strip accents, collapse whitespace. */
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const EXACT = 0
const PREFIX = 1
const SUBSTRING = 2
const NO_MATCH = 3

function words(folded: string): string[] {
  return folded.split(/[\s\-–—'’/().,]+/).filter(Boolean)
}

/** Rank of one option for an already-folded, non-empty query (lower is better; 3 = no match). */
export function rankOption(option: FilterableOption, foldedQuery: string): number {
  const label = foldText(option.label)
  const keywords = (option.keywords ?? []).map(foldText)
  if (label === foldedQuery || keywords.includes(foldedQuery)) return EXACT
  if (
    label.startsWith(foldedQuery) ||
    words(label).some((word) => word.startsWith(foldedQuery)) ||
    keywords.some((keyword) => keyword.startsWith(foldedQuery))
  ) {
    return PREFIX
  }
  if (
    label.includes(foldedQuery) ||
    keywords.some((keyword) => keyword.includes(foldedQuery)) ||
    (option.description !== undefined && foldText(option.description).includes(foldedQuery))
  ) {
    return SUBSTRING
  }
  return NO_MATCH
}

/**
 * The options matching `query`, best first. An empty (or whitespace) query returns every
 * option in its original order.
 */
export function filterOptions<O extends FilterableOption>(
  options: readonly O[],
  query: string,
): O[] {
  const folded = foldText(query)
  if (folded === '') return [...options]
  const ranked: { option: O; rank: number; index: number }[] = []
  options.forEach((option, index) => {
    const rank = rankOption(option, folded)
    if (rank < NO_MATCH) ranked.push({ option, rank, index })
  })
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index)
  return ranked.map((entry) => entry.option)
}

export interface GroupableOption {
  group?: string
}

export interface OptionSection<O> {
  key: string
  label?: string
  options: O[]
}

/**
 * Splits options into sections by `group`, in order of each group's first option (so a ranked
 * list keeps its best group first). Options without a group form an unlabelled section.
 */
export function groupOptions<O extends GroupableOption>(options: readonly O[]): OptionSection<O>[] {
  const sections: OptionSection<O>[] = []
  const byKey = new Map<string, OptionSection<O>>()
  for (const option of options) {
    const key = option.group === undefined ? '' : `g:${option.group}`
    let section = byKey.get(key)
    if (!section) {
      section = { key, label: option.group, options: [] }
      byKey.set(key, section)
      sections.push(section)
    }
    section.options.push(option)
  }
  return sections
}

/**
 * Where `query` matches inside `label`, as `[start, end)` indices into the original label, for
 * highlighting. Folds both sides like `filterOptions`, and prefers the match it ranked: the
 * label's start, then the start of a word, then anywhere. `null` when the label doesn't contain
 * the query (the option matched on a keyword or its description).
 */
export function matchRange(label: string, query: string): [number, number] | null {
  const folded = foldText(query)
  if (folded === '') return null
  // Fold the label one character at a time, remembering which slice of it each folded
  // character came from. A character that folds away (a combining accent) joins the one before.
  let text = ''
  const starts: number[] = []
  const ends: number[] = []
  let index = 0
  for (const char of label) {
    const next = index + char.length
    const piece = /\s/.test(char)
      ? text === '' || text.endsWith(' ')
        ? ''
        : ' '
      : char
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
    if (piece === '' && !/\s/.test(char) && ends.length > 0) ends[ends.length - 1] = next
    starts.push(...Array<number>(piece.length).fill(index))
    ends.push(...Array<number>(piece.length).fill(next))
    text += piece
    index = next
  }
  let start = -1
  if (text.startsWith(folded)) start = 0
  else {
    const boundary = /[\s\-–—'’/().,]/
    for (let at = text.indexOf(folded); at !== -1; at = text.indexOf(folded, at + 1)) {
      if (start === -1) start = at
      if (boundary.test(text.charAt(at - 1))) {
        start = at
        break
      }
    }
  }
  if (start === -1) return null
  return [starts[start] ?? 0, ends[start + folded.length - 1] ?? label.length]
}
