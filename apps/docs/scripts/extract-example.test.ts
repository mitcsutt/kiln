import { resolve } from 'node:path'
import { exampleNames, extractExample, sliceExample } from './extract-example'

// A path inside the app, so Prettier resolves the repo's config.
const file = resolve(import.meta.dirname, 'Fixture.examples.tsx')

function slice(text: string, name: string) {
  return sliceExample(file, text, name)
}

describe('sliceExample', () => {
  it('repeats a shared helper in every example that uses it, and only those', () => {
    const text = `import { Stack, Text } from '@mitcsutt/kiln-ui'

/** Routes shared by the examples below. */
const ROUTES = ['Harbour loop', 'Ferry link']

export function Usage() {
  return <Stack>{ROUTES.map((route) => <Text key={route}>{route}</Text>)}</Stack>
}

export function Count() {
  return <Text>{ROUTES.length}</Text>
}

export function Empty() {
  return <Text>No routes</Text>
}
`
    expect(slice(text, 'Usage')).toBe(`import { Stack, Text } from '@mitcsutt/kiln-ui'

/** Routes shared by the examples below. */
const ROUTES = ['Harbour loop', 'Ferry link']

export function Usage() {
  return <Stack>{ROUTES.map((route) => <Text key={route}>{route}</Text>)}</Stack>
}
`)
    expect(slice(text, 'Count')).toContain('const ROUTES')
    expect(slice(text, 'Empty')).not.toContain('ROUTES')
  })

  it('follows a helper that calls another helper', () => {
    const text = `import { Text } from '@mitcsutt/kiln-ui'

function stops() {
  return 12
}

// Minutes per stop.
const PACE = 3

function duration() {
  return stops() * PACE
}

export function Usage() {
  return <Text>{duration()} minutes</Text>
}
`
    expect(slice(text, 'Usage')).toBe(text)
  })

  it('keeps the types an example uses, imported or declared', () => {
    const text = `import { Table, type TableSort } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

interface Row {
  route: string
}

type Cell = ReactNode

const ROWS: Row[] = [{ route: 'Harbour loop' }]

export function Usage() {
  const sort: TableSort | undefined = undefined
  return <Table data={ROWS} sort={sort} />
}

export function Custom({ cell }: { cell: Cell }) {
  return <Table data={[]}>{cell}</Table>
}
`
    expect(slice(text, 'Usage')).toBe(`import { Table, type TableSort } from '@mitcsutt/kiln-ui'

interface Row {
  route: string
}

const ROWS: Row[] = [{ route: 'Harbour loop' }]

export function Usage() {
  const sort: TableSort | undefined = undefined
  return <Table data={ROWS} sort={sort} />
}
`)
    expect(slice(text, 'Custom')).toBe(`import { Table } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

type Cell = ReactNode

export function Custom({ cell }: { cell: Cell }) {
  return <Table data={[]}>{cell}</Table>
}
`)
  })

  it('ignores a local that shadows a helper', () => {
    const text = `import { Text } from '@mitcsutt/kiln-ui'

const label = 'Harbour loop'

export function Usage() {
  const label = 'Ferry link'
  return <Text>{label}</Text>
}

export function Param({ label }: { label: string }) {
  return <Text>{label}</Text>
}
`
    expect(slice(text, 'Usage')).not.toContain(`'Harbour loop'`)
    expect(slice(text, 'Param')).not.toContain(`'Harbour loop'`)
  })

  it('resolves shorthand properties to the helper they name', () => {
    const text = `import { Text } from '@mitcsutt/kiln-ui'

const label = 'Harbour loop'

export function Usage() {
  const props = { label }
  return <Text>{props.label}</Text>
}
`
    expect(slice(text, 'Usage')).toContain(`const label = 'Harbour loop'`)
  })

  it('prunes unused import names and drops imports left empty', () => {
    const text = `'use client'

import Default, * as Everything from 'some-default'
import { Button, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import './side-effect.css'

export function Usage() {
  return (
    <Inline>
      <Button>Publish</Button>
    </Inline>
  )
}

export function Other() {
  const [open] = useState(false)
  return (
    <Stack>
      <Text>{String(open)}</Text>
      <Default />
      <Everything.Thing />
    </Stack>
  )
}
`
    expect(slice(text, 'Usage')).toBe(`import { Button, Inline } from '@mitcsutt/kiln-ui'
import './side-effect.css'

export function Usage() {
  return (
    <Inline>
      <Button>Publish</Button>
    </Inline>
  )
}
`)
    expect(slice(text, 'Other')).toContain(
      `import Default, * as Everything from 'some-default'\nimport { Stack, Text } from '@mitcsutt/kiln-ui'\nimport { useState } from 'react'`,
    )
  })

  it("keeps a default import or namespace import on its own when it's the only name used", () => {
    const text = `import Default, * as Everything from 'some-default'

export function A() {
  return <Default />
}

export function B() {
  return <Everything.Thing />
}
`
    expect(slice(text, 'A')).toMatch(/^import Default from 'some-default'\n/)
    expect(slice(text, 'B')).toMatch(/^import \* as Everything from 'some-default'\n/)
  })

  it('keeps `import type` when it cuts a type-only import down', () => {
    const text = `import type { ReactNode, ComponentType } from 'react'

export function Usage({ children }: { children: ReactNode }) {
  return children
}
`
    expect(slice(text, 'Usage')).toMatch(/^import type \{ ReactNode \} from 'react'\n/)
  })

  it("slices a default export, dropping the 'use client' directive", () => {
    const text = `'use client'

import { Button } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return <Button>Publish</Button>
}
`
    expect(slice(text, 'default')).toBe(`import { Button } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return <Button>Publish</Button>
}
`)
  })

  it('keeps comments with the declaration they belong to', () => {
    const text = `import { Text } from '@mitcsutt/kiln-ui'

const UNUSED = 1 // not shown

/** Shown with the example. */
const SHOWN = 2 // and this

export function Usage() {
  return <Text>{SHOWN}</Text>
}
`
    expect(slice(text, 'Usage')).toBe(`import { Text } from '@mitcsutt/kiln-ui'

/** Shown with the example. */
const SHOWN = 2 // and this

export function Usage() {
  return <Text>{SHOWN}</Text>
}
`)
  })

  it('rejects side-effect statements and re-export lists', () => {
    expect(() => slice(`console.log('hi')\nexport function A() {}\n`, 'A')).toThrow(
      /only imports and declarations/,
    )
    expect(() => slice(`function A() {}\nexport { A }\n`, 'A')).toThrow(
      /only imports and declarations/,
    )
  })

  it('rejects a name the file does not export', () => {
    expect(() => slice(`export function A() {}\n`, 'B')).toThrow(/no export named B/)
  })
})

describe('exampleNames', () => {
  it('lists the exports in file order', () => {
    const text = `const HELPER = 1\nexport function Usage() { return HELPER }\nexport function Hierarchy() {}\n`
    expect(exampleNames(file, text)).toEqual(['Usage', 'Hierarchy'])
  })
})

describe('extractExample', () => {
  it("formats the slice with the repo's Prettier config", async () => {
    const text = `import { Button } from "@mitcsutt/kiln-ui";\n\nexport function Usage() { return <Button>Publish</Button>; }\n`
    expect(await extractExample(file, text, 'Usage'))
      .toBe(`import { Button } from '@mitcsutt/kiln-ui'

export function Usage() {
  return <Button>Publish</Button>
}
`)
  })
})
