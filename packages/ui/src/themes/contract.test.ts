import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/*
 * The token contract is the public theming API (ADR 0003): DESIGN.md §3.2 lists what every
 * theme sets, §3.3 the optional tokens. Paper is the reference implementation. These must
 * agree, or a consumer writing a theme from the docs would miss a token (or chase one
 * that doesn't exist).
 */
const read = (path: string) => readFileSync(resolve(__dirname, path), 'utf8')
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const declared = (css: string) =>
  new Set([...stripComments(css).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? ''))
const mentioned = (text: string) =>
  new Set([...text.matchAll(/`(--[a-z0-9-]+)`/g)].map((m) => m[1] ?? ''))

function section(markdown: string, heading: string): string {
  const start = markdown.indexOf(heading)
  expect(start, `DESIGN.md has a "${heading}" section`).toBeGreaterThan(-1)
  const end = markdown.indexOf('\n### ', start + heading.length)
  return markdown.slice(start, end === -1 ? undefined : end)
}

describe('token contract', () => {
  const design = read('../../../../DESIGN.md')
  const paper = declared(read('./paper.css'))

  it('documents exactly the tokens the reference theme sets', () => {
    const contract = mentioned(section(design, '### 3.2 The theme contract'))
    expect([...paper].filter((token) => !contract.has(token)).sort()).toEqual([])
    expect([...contract].filter((token) => !paper.has(token)).sort()).toEqual([])
  })

  it('documents exactly the optional tokens every scope resets', () => {
    const foundation = stripComments(read('../tokens/foundation.css'))
    const resetBlock = /(?:^|\n)\s*\[data-theme\]\s*\{([^}]*)\}/.exec(foundation)?.[1] ?? ''
    const optional = mentioned(section(design, '### 3.3 Optional theme tokens'))
    expect([...declared(resetBlock)].sort()).toEqual([...optional].sort())
  })
})
