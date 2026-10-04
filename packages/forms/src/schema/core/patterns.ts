/**
 * Limits for schema `pattern` rules (§10.4). A pattern from untrusted JSON runs
 * against user input on every keystroke and on the server, so a catastrophic-backtracking pattern
 * (`^(a+)+$`) is a denial of service. `parseFormSchema` rejects long patterns, nested quantifiers,
 * repeated alternations and more than `MAX_UNBOUNDED_QUANTIFIERS` unbounded quantifiers; the
 * compiled rule only tests values up to `MAX_PATTERN_INPUT` characters. Schema patterns are for
 * simple formats (postcodes, phone numbers, codes) — put anything richer in a registered validator.
 */

/** Longest `pattern` source `parseFormSchema` accepts. */
export const MAX_PATTERN_LENGTH = 200

/** Longest value a `pattern` rule tests; a longer value fails the rule without running the regex. */
export const MAX_PATTERN_INPUT = 256

/**
 * Most unbounded quantifiers (`*`, `+`, `{n,}`) a schema pattern may use (`^a*a*a*b$` is polynomial
 * blow-up). A bounded quantifier with a range over `WIDE_RANGE` (`{0,50}`) counts too.
 */
export const MAX_UNBOUNDED_QUANTIFIERS = 2

/** A bounded quantifier whose `max - min` exceeds this counts as unbounded. */
export const WIDE_RANGE = 10

const BOUNDED = /^\{(\d+)(,(\d*))?\}/

interface Quantifier {
  length: number
  /** May match more than once (`*`, `+`, `{2}`, `{1,3}`). */
  repeats: boolean
  /** Matches a variable number of times (`*`, `+`, `?`, `{1,3}`; not `{3}`). */
  variable: boolean
  /** No upper bound (`*`, `+`, `{n,}`), or a range wider than `WIDE_RANGE` (`{0,50}`). */
  unbounded: boolean
}

/** The quantifier at `source[i]`, or `undefined`. */
function quantifierAt(source: string, i: number): Quantifier | undefined {
  const char = source[i]
  if (char === '*' || char === '+')
    return { length: 1, repeats: true, variable: true, unbounded: true }
  if (char === '?') return { length: 1, repeats: false, variable: true, unbounded: false }
  if (char !== '{') return undefined
  const match = BOUNDED.exec(source.slice(i))
  if (!match) return undefined
  const min = Number(match[1])
  const open = match[2] !== undefined && (match[3] ?? '') === ''
  const max = match[2] === undefined ? min : open ? Number.POSITIVE_INFINITY : Number(match[3])
  return {
    length: match[0].length,
    repeats: max > 1,
    variable: max > min,
    unbounded: max - min > WIDE_RANGE,
  }
}

/** Index just past the character class that starts at `source[i] === '['`. */
function skipClass(source: string, i: number): number {
  let j = i + 1
  if (source[j] === '^') j += 1
  if (source[j] === ']') j += 1
  while (j < source.length && source[j] !== ']') j += source[j] === '\\' ? 2 : 1
  return j + 1
}

/** Length of a group's opening (`(`, `(?:`, `(?=`, `(?<name>` …). */
function groupOpenLength(source: string, i: number): number {
  if (source[i + 1] !== '?') return 1
  const named = /^\(\?<(?![=!])[^>]*>/.exec(source.slice(i))
  if (named) return named[0].length
  if (source[i + 2] === '<') return 4 // (?<= (?<!
  return 3 // (?: (?= (?!
}

interface PatternShape {
  /** A repeated group contains a variable quantifier (`(a+)+`, star height above 1). */
  nested: boolean
  /** A repeated group contains an alternation (`(a|a)+`). */
  repeatedAlternation: boolean
  /** Count of `*`, `+` and `{n,}`. */
  unbounded: number
}

interface Frame {
  quantified: boolean
  alternation: boolean
}

/** One pass over the pattern source: escapes, classes and group openings are skipped as atoms. */
function shapeOf(source: string): PatternShape {
  const shape: PatternShape = { nested: false, repeatedAlternation: false, unbounded: 0 }
  const frames: Frame[] = [{ quantified: false, alternation: false }]
  const top = () => frames[frames.length - 1] ?? { quantified: false, alternation: false }
  let i = 0
  /** After an atom: consume its quantifier (and a lazy `?`); returns it. */
  const quantifier = () => {
    const q = quantifierAt(source, i)
    if (!q) return undefined
    i += q.length
    if (source[i] === '?') i += 1
    if (q.unbounded) shape.unbounded += 1
    return q
  }
  const atom = (q: Quantifier | undefined) => {
    if (q?.variable) top().quantified = true
  }
  while (i < source.length) {
    const char = source[i]
    if (char === '\\') {
      i += 2
      atom(quantifier())
    } else if (char === '[') {
      i = skipClass(source, i)
      atom(quantifier())
    } else if (char === '(') {
      i += groupOpenLength(source, i)
      frames.push({ quantified: false, alternation: false })
    } else if (char === ')') {
      i += 1
      const inner = frames.length > 1 ? frames.pop() : undefined
      const q = quantifier()
      if (q?.repeats && inner?.quantified) shape.nested = true
      if (q?.repeats && inner?.alternation) shape.repeatedAlternation = true
      if (inner?.alternation) top().alternation = true
      if (inner?.quantified) top().quantified = true
      else atom(q)
    } else if (char === '|') {
      i += 1
      top().alternation = true
    } else {
      i += 1
      if (char !== '^' && char !== '$') atom(quantifier())
    }
  }
  return shape
}

/**
 * True when a repeated group contains a variable quantifier (star height above 1, e.g. `(a+)+`,
 * `(\w*\s?)*`, `(x+){10}`; not `(\d{3})+`): the classic catastrophic-backtracking shape.
 */
export function hasNestedQuantifier(source: string): boolean {
  return shapeOf(source).nested
}

/** Why a schema `pattern` is unsafe to run on untrusted input, or `undefined`. */
export function unsafePatternReason(source: string): string | undefined {
  if (source.length > MAX_PATTERN_LENGTH)
    return `Pattern is longer than ${String(MAX_PATTERN_LENGTH)} characters`
  const shape = shapeOf(source)
  if (shape.nested) {
    return 'Pattern repeats a group that contains a quantifier (e.g. "(a+)+"), which can take exponential time'
  }
  if (shape.repeatedAlternation) {
    return 'Pattern repeats a group that contains an alternation (e.g. "(a|b)+"), which can take exponential time'
  }
  if (shape.unbounded > MAX_UNBOUNDED_QUANTIFIERS) {
    return `Pattern has more than ${String(MAX_UNBOUNDED_QUANTIFIERS)} unbounded or wide quantifiers (*, +, {n,} or a range over ${String(WIDE_RANGE)}), which can take polynomial time`
  }
  return undefined
}
