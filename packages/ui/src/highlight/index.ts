/*
 * @mitcsutt/kiln-ui/highlight: syntax highlighting for CodeBlock, kept out of the main entry.
 * It runs Shiki (an optional peer dependency) with its JavaScript regex engine, and loads Shiki
 * and each grammar only when the first block in that language is highlighted.
 */
import type { CodeToken, CodeTokenType } from '#components/display/CodeBlock'
import { trimTrailingNewlines } from '#utils/newlines'
import type { HighlighterCore, LanguageRegistration, ThemeRegistration } from 'shiki/core'

/** The languages `highlight` understands, with their usual aliases. */
export type HighlightLanguage = 'js' | 'javascript' | 'jsx' | 'ts' | 'typescript' | 'tsx'

type Grammar = 'javascript' | 'jsx' | 'typescript' | 'tsx'

const GRAMMARS: Record<HighlightLanguage, Grammar> = {
  js: 'javascript',
  javascript: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'tsx',
}

const LOADERS: Record<Grammar, () => Promise<{ default: LanguageRegistration[] }>> = {
  javascript: () => import('shiki/langs/javascript.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
}

const TYPES: CodeTokenType[] = [
  'keyword',
  'string',
  'comment',
  'constant',
  'function',
  'type',
  'tag',
  'attribute',
  'punctuation',
]

/** Each token type gets a stand-in colour, which `highlight` reads back as the type. */
const colourOf = (type: CodeTokenType) =>
  `#0000${(TYPES.indexOf(type) + 1).toString(16).padStart(2, '0')}`
const typeOf = new Map(TYPES.map((type) => [colourOf(type), type]))
const PLAIN = '#000000'

/** TextMate scopes → token types. A deeper or longer scope wins, so the exceptions follow. */
const RULES: [string[], CodeTokenType | null][] = [
  [['comment', 'punctuation.definition.comment'], 'comment'],
  [['string', 'punctuation.definition.string'], 'string'],
  [['meta.template.expression'], null],
  [
    ['constant.numeric', 'constant.language', 'constant.character', 'variable.language'],
    'constant',
  ],
  [['keyword', 'storage', 'keyword.operator.new', 'keyword.operator.expression'], 'keyword'],
  [['entity.name.function', 'support.function'], 'function'],
  [
    [
      'entity.name.type',
      'entity.name.class',
      'entity.other.inherited-class',
      'support.type',
      'support.class',
    ],
    'type',
  ],
  [['entity.name.tag'], 'tag'],
  [['entity.other.attribute-name'], 'attribute'],
  [['punctuation', 'meta.brace', 'keyword.operator'], 'punctuation'],
  [
    ['punctuation.definition.string.template.begin', 'punctuation.definition.string.template.end'],
    'string',
  ],
  [['punctuation.definition.template-expression'], 'punctuation'],
]

const THEME: ThemeRegistration = {
  name: 'kiln',
  type: 'light',
  fg: PLAIN,
  bg: '#ffffff',
  settings: RULES.map(([scope, type]) => ({
    scope,
    settings: { foreground: type ? colourOf(type) : PLAIN },
  })),
}

let highlighter: Promise<HighlighterCore> | undefined
const loaded = new Map<Grammar, Promise<void>>()

function load(grammar: Grammar): Promise<HighlighterCore> {
  highlighter ??= Promise.all([import('shiki/core'), import('shiki/engine/javascript')]).then(
    ([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
      createHighlighterCore({ themes: [THEME], langs: [], engine: createJavaScriptRegexEngine() }),
  )
  return highlighter.then(async (core) => {
    let language = loaded.get(grammar)
    if (!language) {
      language = LOADERS[grammar]().then((module) => core.loadLanguage(module.default))
      loaded.set(grammar, language)
    }
    await language
    return core
  })
}

function isHighlightLanguage(language: string): language is HighlightLanguage {
  return Object.hasOwn(GRAMMARS, language)
}

/**
 * Tokens for `CodeBlock`'s `tokens` prop: one array per line of `code`, each token tagged with
 * what it is (keyword, string, comment…) so the theme colours it. Resolves to `undefined` for a
 * language it doesn't know, which `CodeBlock` shows as plain code.
 *
 * @remarks
 * Install `shiki` alongside kiln-ui to use it. Call it wherever your code is ready: in a server
 * component or at build time, so the browser downloads no highlighter, or in the browser, where
 * Shiki and the grammar load on the first call.
 *
 * @example
 * const tokens = await highlight(source, 'tsx')
 * return <CodeBlock code={source} language="TSX" tokens={tokens} />
 */
export async function highlight(
  code: string,
  language: string,
): Promise<CodeToken[][] | undefined> {
  const id = language.toLowerCase()
  if (!isHighlightLanguage(id)) return undefined
  const grammar = GRAMMARS[id]
  const core = await load(grammar)
  const lines = core.codeToTokensBase(trimTrailingNewlines(code), { lang: grammar, theme: 'kiln' })
  return lines.map((line) => {
    const tokens: CodeToken[] = []
    for (const { content, color } of line) {
      const type = color ? typeOf.get(color.toLowerCase()) : undefined
      const previous = tokens.at(-1)
      if (previous && previous.type === type) previous.content += content
      else tokens.push(type ? { content, type } : { content })
    }
    return tokens
  })
}
