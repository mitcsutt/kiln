/** Heading levels as numbers, `1` → `<h1>`. */
export type HeadingTagLevel = 1 | 2 | 3 | 4 | 5 | 6

const HEADING_TAGS = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const

/** The heading element for a level, typed as the matching intrinsic element. */
export function headingTag<L extends HeadingTagLevel>(level: L): (typeof HEADING_TAGS)[L] {
  return HEADING_TAGS[level]
}
