/**
 * Option filtering for type-to-search controls (Combobox). Not exported from the package.
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
