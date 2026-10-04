/**
 * Reads the token contract from Paper, the reference theme, and writes
 * `.generated/tokens.json`: every contract token with Paper's value, the optional tokens
 * every theme scope resets, and a complete starter theme to copy. kiln-ui's
 * `themes/contract.test.ts` keeps Paper and DESIGN.md §3.2 identical, so this can't drift
 * from the documented contract either.
 *
 * It also reads each component's own tokens from the comment at the top of its CSS Module
 * (packages/ui/AGENTS.md asks every module to list them there), keyed by component.
 *
 *   node scripts/generate-tokens.ts
 */
import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../..')
const out = resolve(import.meta.dirname, '../.generated/tokens.json')

const paper = readFileSync(join(root, 'packages/ui/src/themes/paper.css'), 'utf8')
const foundation = readFileSync(join(root, 'packages/ui/src/tokens/foundation.css'), 'utf8')

export interface Token {
  name: string
  value: string
}

export interface TokenGroup {
  title: string
  tokens: Token[]
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

function declarations(css: string): Token[] {
  return [...stripComments(css).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => ({
    name: match[1] ?? '',
    value: (match[2] ?? '').replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim(),
  }))
}

// Paper's block is split into sections by comments like `/* ── Type roles ──── */`.
const body = /\[data-theme='paper'\]\s*\{([\s\S]*)\}\s*\}\s*$/.exec(paper)?.[1]
if (!body) throw new Error("Couldn't find Paper's theme block")
const sections = body.split(/\/\* ── ([^─]+?) ─+ \*\//)
const groups: TokenGroup[] = []
for (let index = 1; index < sections.length; index += 2) {
  const title = (sections[index] ?? '').trim()
  const tokens = declarations(sections[index + 1] ?? '')
  if (tokens.length) groups.push({ title, tokens })
}

const resetBlock = /\n\s*\[data-theme\]\s*\{([^}]*)\}/.exec(stripComments(foundation))?.[1] ?? ''
const optional = declarations(resetBlock).map((token) => token.name)

const starterTheme = [
  '/* harbour.css: a theme for Kiln. Every token in the contract, starting from Paper. */',
  '@layer kiln.reset, kiln.tokens, kiln.themes;',
  '',
  '@layer kiln.themes {',
  "  [data-theme='harbour'] {",
  ...groups.flatMap((group, index) => [
    ...(index ? [''] : []),
    `    /* ${group.title} */`,
    ...group.tokens.map((token) => `    ${token.name}: ${token.value};`),
  ]),
  '  }',
  '}',
  '',
].join('\n')

export interface ComponentToken {
  name: string
  description: string
}

/** The `Component tokens:` list in a module's header comment, with wrapped lines joined. */
function componentTokens(css: string): ComponentToken[] {
  const header = /^\/\*([\s\S]*?)\*\//.exec(css)?.[1] ?? ''
  const start = header.search(/Component tokens/)
  if (start === -1) return []
  const tokens: ComponentToken[] = []
  for (const line of header.slice(start).split('\n').slice(1)) {
    const text = line.replace(/^\s*\*/, '')
    if (!text.trim()) {
      if (tokens.length) break
      continue
    }
    const token = /^\s+(--[a-z0-9-]+(?:[{][^}]+[}][a-z0-9-]*)?)\s+(.*)$/.exec(text)
    const previous = tokens.at(-1)
    if (token?.[1]) tokens.push({ name: token[1], description: (token[2] ?? '').trim() })
    else if (previous && /^\s{4,}/.test(text)) previous.description += ` ${text.trim()}`
    else if (tokens.length) break
  }
  return tokens
}

const components: Record<string, ComponentToken[]> = {}
for (const file of globSync('packages/ui/src/components/*/*/*.module.css', { cwd: root })) {
  const name = basename(dirname(file))
  if (basename(file) !== `${name}.module.css`) continue
  const tokens = componentTokens(readFileSync(join(root, file), 'utf8'))
  if (tokens.length) components[name] = tokens
}

const count = groups.reduce((sum, group) => sum + group.tokens.length, 0)
mkdirSync(resolve(out, '..'), { recursive: true })
writeFileSync(out, `${JSON.stringify({ groups, optional, starterTheme, components }, null, 2)}\n`)
console.log(
  `tokens.json: ${String(count)} contract tokens, ${String(optional.length)} optional, ${String(Object.keys(components).length)} components with tokens`,
)
