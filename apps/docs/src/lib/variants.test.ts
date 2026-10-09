import { contentPages } from '@/test/content'
import { toMarkdown } from './to-markdown'
import {
  resolveVariants,
  splitVariants,
  variantOf,
  variantRuns,
  variantValues,
  type VariantKey,
} from './variants'

const page = `Intro.

## Routes

Keep routes thin.

<Variant router="tanstack">

A route file renders a page:

\`\`\`tsx
export const Route = createFileRoute('/contacts')({ component: Contacts })
\`\`\`

</Variant>

<Variant router="next">

A \`page.tsx\` renders a page.

</Variant>

## Data

<Variant data="rest">

Request functions.

</Variant>

<Variant data="graphql">

Typed documents.

</Variant>

## Names

Names stand alone.
`

describe('splitVariants', () => {
  it('separates page text from variant blocks', () => {
    const segments = splitVariants(page)
    expect(segments.map((segment) => segment.variant?.value ?? 'text')).toEqual([
      'text',
      'tanstack',
      'next',
      'text',
      'rest',
      'graphql',
      'text',
    ])
    expect(segments[1]?.text).toContain("createFileRoute('/contacts')")
  })

  it('reads the indented blocks of the processed Markdown', () => {
    const processed =
      '<Variant router="next">\n  A `page.tsx`.\n\n  ```ts\n  const a = 1\n  ```\n</Variant>\n'
    expect(splitVariants(processed)).toEqual([
      {
        text: 'A `page.tsx`.\n\n```ts\nconst a = 1\n```',
        variant: { axis: 'router', value: 'next' },
      },
    ])
  })

  it('leaves tags inside code alone', () => {
    const code = '```mdx\n<Variant router="next">\n\nText\n\n</Variant>\n```\n'
    expect(splitVariants(code)).toEqual([{ text: code }])
  })

  it('rejects an unknown axis or value, a nested block, a heading and an unclosed block', () => {
    expect(() => splitVariants('<Variant os="mac">\n\nx\n\n</Variant>')).toThrow('known axis')
    expect(() => splitVariants('<Variant router="remix">\n\nx\n\n</Variant>')).toThrow(
      'known value',
    )
    expect(() =>
      splitVariants('<Variant router="next">\n<Variant data="rest">\n</Variant>\n</Variant>'),
    ).toThrow('never nest')
    expect(() => splitVariants('<Variant router="next">\n\n## Next\n\n</Variant>')).toThrow(
      'no heading',
    )
    expect(() => splitVariants('<Variant router="next">\n\nx\n')).toThrow("isn't closed")
  })
})

describe('resolveVariants', () => {
  it('labels every block for the Markdown routes', () => {
    const all = resolveVariants(page, 'all')
    expect(all).toContain('**Router: TanStack Router**\n\nA route file renders a page:')
    expect(all).toContain('**Router: Next.js**\n\nA `page.tsx` renders a page.')
    expect(all).toContain('**Data: GraphQL**\n\nTyped documents.')
    expect(all).not.toContain('<Variant')
  })

  it('drops every block, and the headings left empty, for a core skill', () => {
    expect(resolveVariants(page, 'none')).toBe(
      'Intro.\n\n## Routes\n\nKeep routes thin.\n\n## Names\n\nNames stand alone.\n',
    )
  })

  it("keeps one value's blocks, under their headings, for an add-on", () => {
    expect(resolveVariants(page, { axis: 'router', value: 'next' })).toBe(
      '## Routes\n\nA `page.tsx` renders a page.',
    )
    expect(resolveVariants(page, { axis: 'data', value: 'rest' })).toBe(
      '## Data\n\nRequest functions.',
    )
  })

  it('leaves a page without blocks as it is', () => {
    expect(resolveVariants('Plain.\n', 'none')).toBe('Plain.\n')
  })
})

describe('toMarkdown', () => {
  it('keeps the code inside a block as written', () => {
    expect(toMarkdown(page)).toContain(
      "```tsx\nexport const Route = createFileRoute('/contacts')({ component: Contacts })\n```",
    )
  })
})

describe('variantOf', () => {
  it('reads the one axis a block names', () => {
    expect(variantOf({ data: 'tanstack-query' })).toEqual({ axis: 'data', value: 'tanstack-query' })
  })

  it('rejects no axis, two axes and an unknown value', () => {
    expect(() => variantOf({})).toThrow('exactly one')
    expect(() => variantOf({ router: 'next', data: 'rest' })).toThrow('exactly one')
    expect(() => variantOf({ router: 'remix' })).toThrow('known value')
  })
})

// The site shows a run of blocks as one switch, so a reader who picks a value must see a block.
describe('every run of variant blocks on a docs page', () => {
  const runs = contentPages().flatMap((docsPage) =>
    variantRuns(docsPage.body).map(
      (run, index) => [`${docsPage.path}, run ${String(index + 1)}`, run] as const,
    ),
  )

  it.each(runs)('%s covers every value of its axis once', (_name, run: VariantKey[]) => {
    const [first] = run
    if (!first) throw new Error('An empty run')
    expect(run.map((key) => key.value).sort()).toEqual(variantValues(first.axis).sort())
  })

  it('runs in the example', () => {
    expect(variantRuns(page).map((run) => run.map((key) => key.value))).toEqual([
      ['tanstack', 'next'],
      ['rest', 'graphql'],
    ])
  })
})
