/*
 * JSON for JsonInput: a strict parser that reports where the text goes wrong in words, a printer
 * that formats or minifies without round-tripping through numbers (so `1.50` and
 * `12345678901234567890` keep their text), and a tolerant tokenizer that highlights text that
 * isn't valid yet. No dependencies, and the same messages in every browser.
 */
import type { CodeToken } from '#components/display/CodeBlock'

/** Where a JSON text goes wrong: a message, and the 1-based line and column it points at. */
export interface JsonSyntaxError {
  message: string
  line: number
  column: number
  /** 0-based offset into the text. */
  offset: number
}

/** How formatted JSON is indented: two spaces, four spaces, or a tab. */
export type JsonIndent = 2 | 4 | 'tab'

type JsonNode =
  | { kind: 'object'; members: { key: string; value: JsonNode }[] }
  | { kind: 'array'; items: JsonNode[] }
  | { kind: 'literal'; raw: string }

export type JsonParse =
  { ok: true; node: JsonNode; value: unknown } | { ok: false; error: JsonSyntaxError }

class Failure extends Error {
  constructor(
    message: string,
    readonly offset: number,
  ) {
    super(message)
  }
}

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y
const ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't'])
const HEX = /^[0-9a-fA-F]{4}$/
const WORD = /[A-Za-z0-9_$.+-]/

/** Describes the character at `at` for a message: "}", "the end of the text". */
function describe(text: string, at: number): string {
  const ch = text[at]
  if (ch === undefined) return 'the end of the text'
  if (ch === '\n' || ch === '\r') return 'a line break'
  return `“${ch}”`
}

function parseNode(text: string): JsonNode {
  let i = 0
  const skip = () => {
    while (i < text.length) {
      const ch = text[i]
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') i++
      else break
    }
  }
  const string = (): string => {
    const start = i
    i++
    while (i < text.length) {
      const ch = text[i]
      if (ch === '"') {
        i++
        return text.slice(start, i)
      }
      if (ch === '\\') {
        const next = text[i + 1]
        if (next === 'u') {
          if (!HEX.test(text.slice(i + 2, i + 6)))
            throw new Failure('A \\u escape needs four hex digits', i)
          i += 6
          continue
        }
        if (next === undefined || !ESCAPES.has(next))
          throw new Failure(`“\\${next ?? ''}” isn't an escape JSON knows`, i)
        i += 2
        continue
      }
      if (ch === '\n' || ch === '\r')
        throw new Failure('This string isn’t closed before the end of the line', start)
      if (ch !== undefined && ch < ' ')
        throw new Failure('Strings can’t contain control characters: escape them', i)
      i++
    }
    throw new Failure('This string isn’t closed', start)
  }
  const value = (): JsonNode => {
    skip()
    const ch = text[i]
    if (ch === '{') return object()
    if (ch === '[') return array()
    if (ch === '"') return { kind: 'literal', raw: string() }
    if (ch === '-' || (ch !== undefined && ch >= '0' && ch <= '9')) {
      NUMBER.lastIndex = i
      const match = NUMBER.exec(text)
      const end = match ? i + match[0].length : i
      if (!match || WORD.test(text[end] ?? '')) throw new Failure('This isn’t a valid number', i)
      const raw = match[0]
      i = end
      return { kind: 'literal', raw }
    }
    for (const word of ['true', 'false', 'null']) {
      if (text.startsWith(word, i) && !WORD.test(text[i + word.length] ?? '')) {
        i += word.length
        return { kind: 'literal', raw: word }
      }
    }
    if (ch === undefined) throw new Failure('Expected a value, but the text ends here', i)
    if (ch === "'") throw new Failure('Strings need double quotes', i)
    throw new Failure(`Expected a value, not ${describe(text, i)}`, i)
  }
  const object = (): JsonNode => {
    const open = i
    i++
    const members: { key: string; value: JsonNode }[] = []
    skip()
    if (text[i] === '}') {
      i++
      return { kind: 'object', members }
    }
    for (;;) {
      skip()
      if (text[i] !== '"') {
        if (text[i] === undefined) throw new Failure('This object isn’t closed with “}”', open)
        throw new Failure('Expected a property name in double quotes', i)
      }
      const key = string()
      skip()
      if (text[i] !== ':') throw new Failure('Expected “:” after the property name', i)
      i++
      members.push({ key, value: value() })
      skip()
      if (text[i] === ',') {
        const comma = i
        i++
        skip()
        if (text[i] === '}') throw new Failure('Remove this comma: nothing follows it', comma)
        continue
      }
      if (text[i] === '}') {
        i++
        return { kind: 'object', members }
      }
      if (text[i] === undefined) throw new Failure('This object isn’t closed with “}”', open)
      throw new Failure(`Expected “,” or “}”, not ${describe(text, i)}`, i)
    }
  }
  const array = (): JsonNode => {
    const open = i
    i++
    const items: JsonNode[] = []
    skip()
    if (text[i] === ']') {
      i++
      return { kind: 'array', items }
    }
    for (;;) {
      if (text[i] === undefined) throw new Failure('This array isn’t closed with “]”', open)
      items.push(value())
      skip()
      if (text[i] === ',') {
        const comma = i
        i++
        skip()
        if (text[i] === ']') throw new Failure('Remove this comma: nothing follows it', comma)
        continue
      }
      if (text[i] === ']') {
        i++
        return { kind: 'array', items }
      }
      if (text[i] === undefined) throw new Failure('This array isn’t closed with “]”', open)
      throw new Failure(`Expected “,” or “]”, not ${describe(text, i)}`, i)
    }
  }

  const node = value()
  skip()
  if (i < text.length) throw new Failure('Unexpected text after the JSON value', i)
  return node
}

/** 1-based line and column of `offset`. */
export function positionOf(text: string, offset: number): { line: number; column: number } {
  let line = 1
  let start = 0
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++
      start = i + 1
    }
  }
  return { line, column: offset - start + 1 }
}

/** Parses `text` strictly, with the position and a plain message when it isn't valid. */
export function parseJson(text: string): JsonParse {
  try {
    const node = parseNode(text)
    return { ok: true, node, value: JSON.parse(text) as unknown }
  } catch (reason) {
    const offset = reason instanceof Failure ? reason.offset : 0
    const message = reason instanceof Error ? reason.message : String(reason)
    return { ok: false, error: { message, offset, ...positionOf(text, offset) } }
  }
}

const keyOf = (raw: string) => JSON.parse(raw) as string

function print(node: JsonNode, unit: string, sortKeys: boolean, depth: number): string {
  if (node.kind === 'literal') return node.raw
  const pretty = unit !== ''
  const inner = pretty ? `\n${unit.repeat(depth + 1)}` : ''
  const outer = pretty ? `\n${unit.repeat(depth)}` : ''
  const separator = pretty ? ': ' : ':'
  if (node.kind === 'array') {
    if (node.items.length === 0) return '[]'
    const items = node.items.map((item) => print(item, unit, sortKeys, depth + 1))
    return `[${inner}${items.join(`,${inner}`)}${outer}]`
  }
  if (node.members.length === 0) return '{}'
  const members = sortKeys
    ? [...node.members].sort((a, b) => {
        const x = keyOf(a.key)
        const y = keyOf(b.key)
        return x < y ? -1 : x > y ? 1 : 0
      })
    : node.members
  const lines = members.map(
    ({ key, value }) => `${key}${separator}${print(value, unit, sortKeys, depth + 1)}`,
  )
  return `{${inner}${lines.join(`,${inner}`)}${outer}}`
}

/**
 * `text` re-indented, or `undefined` when it isn't valid JSON. Numbers and strings keep their
 * exact text, and keys keep their order unless `sortKeys`.
 */
export function formatJson(
  text: string,
  { indent = 2, sortKeys = false }: { indent?: JsonIndent; sortKeys?: boolean } = {},
): string | undefined {
  const parsed = parseJson(text)
  if (!parsed.ok) return undefined
  return print(parsed.node, indent === 'tab' ? '\t' : ' '.repeat(indent), sortKeys, 0)
}

/** `text` on one line with no spaces, or `undefined` when it isn't valid JSON. */
export function minifyJson(
  text: string,
  { sortKeys = false }: { sortKeys?: boolean } = {},
): string | undefined {
  const parsed = parseJson(text)
  if (!parsed.ok) return undefined
  return print(parsed.node, '', sortKeys, 0)
}

const PUNCTUATION = new Set(['{', '}', '[', ']', ':', ','])
const LOOSE_NUMBER = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y
const LOOSE_WORD = /true|false|null/y

/**
 * Tokens for highlighting, one array per line, in `CodeBlock`'s token types: property names are
 * `type`, strings `string`, numbers, `true`, `false` and `null` `constant`, and brackets, colons
 * and commas `punctuation`. Tolerant: text that isn't valid JSON yet still highlights as far as
 * it reads.
 */
export function tokenizeJson(text: string): CodeToken[][] {
  const flat: CodeToken[] = []
  const push = (content: string, type?: CodeToken['type']) => {
    const previous = flat.at(-1)
    if (previous && previous.type === type) previous.content += content
    else flat.push(type ? { content, type } : { content })
  }
  let i = 0
  while (i < text.length) {
    const ch = text.charAt(i)
    if (ch === '"') {
      let end = i + 1
      while (end < text.length) {
        const c = text[end]
        if (c === '\\') end += 2
        else if (c === '"') {
          end++
          break
        } else if (c === '\n') break
        else end++
      }
      end = Math.min(end, text.length)
      let after = end
      while (after < text.length && /\s/.test(text.charAt(after))) after++
      push(text.slice(i, end), text[after] === ':' ? 'type' : 'string')
      i = end
      continue
    }
    if (PUNCTUATION.has(ch)) {
      push(ch, 'punctuation')
      i++
      continue
    }
    LOOSE_NUMBER.lastIndex = i
    LOOSE_WORD.lastIndex = i
    const literal = LOOSE_NUMBER.exec(text) ?? LOOSE_WORD.exec(text)
    if (literal?.index === i) {
      push(literal[0], 'constant')
      i += literal[0].length
      continue
    }
    push(ch)
    i++
  }
  // Split into lines. Only plain runs (whitespace, stray text) can hold a line break.
  const lines: CodeToken[][] = [[]]
  for (const token of flat) {
    const parts = token.content.split('\n')
    parts.forEach((part, index) => {
      if (index > 0) lines.push([])
      if (part) lines[lines.length - 1]?.push({ ...token, content: part })
    })
  }
  return lines
}
