/**
 * A component that styles another component through `className` must win on specificity, not on
 * stylesheet order.
 *
 * A bundler can emit CSS Modules chunks in any order (Next.js/Turbopack does, with no setting to
 * pin it), so `.copy` on CodeBlock's Button or `.chips` on TagsInput's TagList must outrank the
 * inner component's base class (`.button`, `.list`) whichever sheet loads first. jsdom loads no
 * stylesheets in this package's tests, so the real module CSS is injected here in both orders
 * (class names are non-scoped in this config). jsdom's `getComputedStyle` cascades by source order
 * alone, ignoring specificity, so `cascaded` below resolves a property the way a browser does.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CodeBlock } from '#components/display/CodeBlock'
import { TagsInput } from '#components/inputs/TagsInput'
import { must } from '#test/must'

let styles: HTMLStyleElement[] = []
afterEach(() => {
  for (const style of styles) style.remove()
  styles = []
})

function inject(path: string) {
  const style = document.createElement('style')
  style.textContent = readFileSync(join(process.cwd(), 'src/components', path), 'utf8')
  document.head.append(style)
  styles.push(style)
}

/** Splits a selector list on its top-level commas. */
function splitList(list: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < list.length; i++) {
    const char = list[i]
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (char === ',' && depth === 0) {
      parts.push(list.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(list.slice(start).trim())
  return parts
}

type Specificity = [number, number, number]

const compare = (a: Specificity, b: Specificity) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

/** Selectors Level 4 specificity of one complex selector (no namespaces or escapes). */
function specificity(selector: string): Specificity {
  const total: Specificity = [0, 0, 0]
  let i = 0
  while (i < selector.length) {
    const rest = selector.slice(i)
    const fn = /^:(where|is|not|has)\(/.exec(rest)
    if (fn) {
      let depth = 1
      let end = fn[0].length
      while (depth > 0) {
        if (rest[end] === '(') depth++
        else if (rest[end] === ')') depth--
        end++
      }
      if (fn[1] !== 'where') {
        const inner = splitList(rest.slice(fn[0].length, end - 1)).map(specificity)
        const max = inner.reduce((a, b) => (compare(a, b) >= 0 ? a : b))
        total[0] += max[0]
        total[1] += max[1]
        total[2] += max[2]
      }
      i += end
      continue
    }
    const token =
      /^(#[\w-]+|\.[\w-]+|\[[^\]]*\]|::[\w-]+|:[\w-]+(\([^)]*\))?|[a-zA-Z][\w-]*|\*|[\s>+~]+)/.exec(
        rest,
      )
    if (!token) throw new Error(`Unsupported selector: ${selector}`)
    const [text] = token
    if (text.startsWith('#')) total[0]++
    else if (text.startsWith('::') || /^[a-zA-Z]/.test(text)) total[2]++
    else if (/^[.[:]/.test(text)) total[1]++
    i += text.length
  }
  return total
}

/**
 * The cascaded value of `property` on `element` from the injected author sheets: the highest
 * specificity wins, then the later rule. Grouping rules (`@media`) are treated as matching.
 */
function cascaded(element: Element, property: string): string {
  let winner: { specificity: Specificity; value: string } | undefined
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        const value = rule.style.getPropertyValue(property)
        if (!value) continue
        for (const selector of splitList(rule.selectorText)) {
          if (!element.matches(selector)) continue
          const own = specificity(selector)
          if (!winner || compare(own, winner.specificity) >= 0) winner = { specificity: own, value }
        }
      } else if ('cssRules' in rule) {
        visit((rule as CSSGroupingRule).cssRules)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules)
  return winner?.value ?? ''
}

const orders = (outer: string, inner: string): [string, string[]][] => [
  [`${inner}, then ${outer}`, [inner, outer]],
  [`${outer}, then ${inner}`, [outer, inner]],
]

describe('cascaded', () => {
  it('ranks by specificity before source order', () => {
    inject('display/Tag/Tag.module.css')
    const style = document.createElement('style')
    style.textContent = '.list { display: grid } .x:where(.list) { display: block }'
    document.head.append(style)
    styles.push(style)
    const { container } = render(<ul className="list" />)
    expect(cascaded(must(container.firstElementChild), 'display')).toBe('grid')
  })
})

describe('composed component styles do not depend on stylesheet order', () => {
  for (const [label, sheets] of orders(
    'display/CodeBlock/CodeBlock.module.css',
    'actions/Button/Button.module.css',
  )) {
    it(`CodeBlock's copy button is muted when loading ${label}`, () => {
      for (const sheet of sheets) inject(sheet)
      render(<CodeBlock code="const a = 1" />)
      const copy = screen.getByRole('button', { name: 'Copy code' })
      expect(cascaded(copy, 'color')).toBe('var(--color-ink-muted)')
      expect(cascaded(copy, 'margin-inline-start')).toBe('auto')
    })
  }

  for (const [label, sheets] of orders(
    'inputs/TagsInput/TagsInput.module.css',
    'display/Tag/Tag.module.css',
  )) {
    it(`TagsInput's chip list is display: contents when loading ${label}`, () => {
      for (const sheet of sheets) inject(sheet)
      render(<TagsInput aria-label="Labels" defaultValue={['Design']} />)
      expect(cascaded(screen.getByRole('list'), 'display')).toBe('contents')
    })
  }
})
