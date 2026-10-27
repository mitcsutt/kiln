import { contentPages } from '@/test/content'
import { toMarkdown } from './to-markdown'
import { variantRuns, variantValues, type VariantKey } from './variants'

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

describe('toMarkdown', () => {
  it('keeps the code inside a block as written', () => {
    expect(toMarkdown(page)).toContain(
      "```tsx\nexport const Route = createFileRoute('/contacts')({ component: Contacts })\n```",
    )
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
})
