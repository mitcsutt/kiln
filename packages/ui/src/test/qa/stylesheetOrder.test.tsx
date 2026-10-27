/**
 * A component that styles another component through `className` must win on specificity, not on
 * stylesheet order.
 *
 * A bundler can emit CSS Modules chunks in any order (Next.js/Turbopack does, with no setting to
 * pin it), so `.copy` on CodeBlock's Button, `.chips` on TagsInput's TagList or `.chevron` on
 * TreeTable's icon must outrank the inner component's base class (`.button`, `.list`, `.icon`)
 * whichever sheet loads first. jsdom loads no
 * stylesheets in this package's tests, so the real module CSS is injected here in both orders
 * (class names are non-scoped in this config). jsdom's `getComputedStyle` cascades by source order
 * alone, ignoring specificity, so `cascaded` below resolves a property the way a browser does.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { CodeBlock } from '#components/display/CodeBlock'
import { TreeTable } from '#components/display/TreeTable'
import { Checkbox } from '#components/inputs/Checkbox'
import { Combobox } from '#components/inputs/Combobox'
import { DateRangePickerField } from '#components/inputs/DateRangeField'
import { FileDrop } from '#components/inputs/FileDrop'
import { TagsInput } from '#components/inputs/TagsInput'
import { TextField } from '#components/inputs/TextField'
import { CommandPalette } from '#components/overlays/CommandPalette'
import { Link } from '#components/typography/Link'
import { must } from '#test/must'

let styles: HTMLStyleElement[] = []
afterEach(() => {
  for (const style of styles) style.remove()
  styles = []
})

function inject(path: string) {
  const style = document.createElement('style')
  style.textContent = readFileSync(join(process.cwd(), 'src', path), 'utf8')
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
    inject('components/display/Tag/Tag.module.css')
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
    'components/display/CodeBlock/CodeBlock.module.css',
    'components/actions/Button/Button.module.css',
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
    'components/inputs/TagsInput/TagsInput.module.css',
    'components/display/Tag/Tag.module.css',
  )) {
    it(`TagsInput's chip list is display: contents when loading ${label}`, () => {
      for (const sheet of sheets) inject(sheet)
      render(<TagsInput aria-label="Labels" defaultValue={['Design']} />)
      expect(cascaded(screen.getByRole('list'), 'display')).toBe('contents')
    })
  }

  const icon = 'icons/Icon.module.css'
  const spinner = 'components/feedback/Spinner/Spinner.module.css'
  const messages = 'components/inputs/internal/messages.module.css'
  const combobox = 'components/inputs/Combobox/Combobox.module.css'
  const palette = 'components/overlays/CommandPalette/CommandPalette.module.css'
  const query = (selector: string) => must(document.querySelector(selector))

  async function openPalette(props: { loading?: boolean } = {}) {
    render(
      <CommandPalette
        {...props}
        trigger={<button type="button">Search</button>}
        actions={[{ id: 'switch', label: 'Switch project', actions: [{ id: 'a', label: 'A' }] }]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
  }

  /** [what, outer sheet, inner sheet, render and return the element, expected cascaded values] */
  const cases: [
    string,
    string,
    string,
    () => Promise<Element> | Element,
    Record<string, string>,
  ][] = [
    [
      "TreeTable's chevron is 1rem",
      'components/display/TreeTable/TreeTable.module.css',
      icon,
      () => {
        const rows: { id: string; children?: { id: string }[] }[] = [
          { id: 'a', children: [{ id: 'b' }] },
        ]
        render(
          <TreeTable
            label="Sessions"
            columns={[{ id: 'name', header: 'Session' }]}
            rows={rows}
            getRowId={(row) => row.id}
            getChildren={(row) => row.children}
            renderCell={(row) => row.id}
          />,
        )
        return query('.chevron')
      },
      { 'inline-size': '1rem', 'block-size': '1rem' },
    ],
    [
      "FileDrop's icon is 1.25em",
      'components/inputs/FileDrop/FileDrop.module.css',
      icon,
      () => {
        render(<FileDrop aria-label="Receipts" />)
        return query('.zone > svg')
      },
      { 'inline-size': '1.25em', 'block-size': '1.25em' },
    ],
    [
      "Checkbox's tick is 88% with a heavier stroke",
      'components/inputs/Checkbox/Checkbox.module.css',
      icon,
      () => {
        render(<Checkbox aria-label="Agree" defaultChecked />)
        return query('.check')
      },
      { 'inline-size': '88%', 'stroke-width': 'calc(var(--icon-stroke) * 1.4)' },
    ],
    [
      "Checkbox's dash is 88% with a heavier stroke",
      'components/inputs/Checkbox/Checkbox.module.css',
      icon,
      () => {
        render(<Checkbox aria-label="Agree" defaultChecked="indeterminate" />)
        return query('.dash')
      },
      { 'inline-size': '88%', 'stroke-width': 'calc(var(--icon-stroke) * 1.4)' },
    ],
    [
      "Combobox's chevron is 1.15em",
      combobox,
      icon,
      () => {
        render(<Combobox aria-label="Category" options={[{ value: 'a', label: 'A' }]} />)
        return query('.chevron')
      },
      { 'inline-size': '1.15em' },
    ],
    [
      "Combobox's selected-option check is 1.1em",
      combobox,
      icon,
      async () => {
        render(
          <Combobox
            aria-label="Category"
            options={[{ value: 'a', label: 'A' }]}
            defaultValue="a"
          />,
        )
        await userEvent.click(screen.getByRole('combobox'))
        return query('.check')
      },
      { 'inline-size': '1.1em' },
    ],
    [
      "Combobox's spinner is subtle",
      combobox,
      spinner,
      () => {
        render(<Combobox aria-label="Category" options={[]} loading />)
        return query('.spinner')
      },
      { color: 'var(--color-ink-subtle)' },
    ],
    [
      "Combobox's chip list is display: contents",
      combobox,
      'components/display/Tag/Tag.module.css',
      () => {
        render(
          <Combobox
            multiple
            aria-label="Labels"
            options={[{ value: 'a', label: 'A' }]}
            defaultValue={['a']}
          />,
        )
        return screen.getByRole('list')
      },
      { display: 'contents' },
    ],
    [
      "DateRangePickerField's presets are start-aligned",
      'components/inputs/DateRangeField/DateRangeField.module.css',
      'components/actions/Button/Button.module.css',
      async () => {
        render(
          <DateRangePickerField
            label="Period"
            presets={[{ label: 'October', value: { start: '2026-10-01', end: '2026-10-31' } }]}
          />,
        )
        await userEvent.click(screen.getByRole('button', { name: 'Choose date' }))
        const presets = await screen.findByRole('group', { name: 'Presets' })
        return within(presets).getByRole('button', { name: 'October' })
      },
      { 'justify-content': 'flex-start' },
    ],
    [
      "a field error's icon is one line tall",
      messages,
      icon,
      () => {
        render(<TextField label="Name" error="Required" />)
        return query('.errorIcon')
      },
      { 'inline-size': '1.1em', 'block-size': '1lh' },
    ],
    [
      "a field warning's icon is one line tall",
      messages,
      icon,
      () => {
        render(<TextField label="Name" warning="Unusual" />)
        return query('.warningIcon')
      },
      { 'inline-size': '1.1em', 'block-size': '1lh' },
    ],
    [
      "a validating field's spinner is subtle",
      messages,
      spinner,
      () => {
        render(<TextField label="Name" validating />)
        return query('.busy')
      },
      { color: 'var(--color-ink-subtle)' },
    ],
    [
      "CommandPalette's search icon is 1.15em",
      palette,
      icon,
      async () => {
        await openPalette()
        return query('.searchIcon')
      },
      { 'inline-size': '1.15em' },
    ],
    [
      "CommandPalette's sub-action chevron is 1.1em",
      palette,
      icon,
      async () => {
        await openPalette()
        return query('.option .chevron')
      },
      { 'inline-size': '1.1em' },
    ],
    [
      "CommandPalette's spinner is subtle",
      palette,
      spinner,
      async () => {
        await openPalette({ loading: true })
        return query('.spinner')
      },
      { color: 'var(--color-ink-subtle)' },
    ],
    [
      "an external Link's arrow is 0.85em",
      'components/typography/Link/Link.module.css',
      icon,
      () => {
        render(
          <Link href="https://example.com" external>
            Example
          </Link>,
        )
        return query('.iconWrap > svg')
      },
      { 'inline-size': '0.85em' },
    ],
  ]

  for (const [what, outer, inner, find, expected] of cases) {
    for (const [label, sheets] of orders(outer, inner)) {
      it(`${what} when loading ${label}`, async () => {
        for (const sheet of sheets) inject(sheet)
        const element = await find()
        for (const [property, value] of Object.entries(expected)) {
          expect(cascaded(element, property), property).toBe(value)
        }
      })
    }
  }
})
