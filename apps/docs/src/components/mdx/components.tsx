import { highlight } from '@mitcsutt/kiln-ui/highlight'
import { examples } from '../../../.generated/examples'
import { getApi } from '@/lib/api'
import { exampleId, getExampleSource } from '@/lib/examples'
import { Preview, type PreviewLayout } from './Preview'
import { PropsTable } from './PropsTable'
import { Signature } from './client'

/**
 * A live example with its source underneath: `<Example of="Button" name="Hierarchy" />`
 * (`exampleId`).
 */
export async function Example({
  of,
  name,
  layout,
}: {
  of: string
  name?: string
  layout?: PreviewLayout
}) {
  const id = exampleId({ of, name })
  const Component = examples[id]
  if (!Component) throw new Error(`No example ${id}`)
  const code = getExampleSource(id)
  return (
    <Preview code={code} tokens={await highlight(code, 'tsx')} layout={layout}>
      <Component />
    </Preview>
  )
}

/** The props of one or more types, generated from kiln-ui, kiln-forms and kiln-dnd source. */
export function ApiTable({ of }: { of: string }) {
  const names = of.split(',').map((name) => name.trim())
  return (
    <>
      {names.map((name) => {
        const entry = getApi(name)
        return (
          <PropsTable
            key={name}
            name={name}
            props={entry.props ?? []}
            inherits={entry.extends ?? []}
            caption={names.length > 1 ? name : undefined}
          />
        )
      })}
    </>
  )
}

/** A function's or hook's signature, as TypeScript prints it. */
export async function ApiSignature({ of }: { of: string }) {
  const entry = getApi(of)
  const code = entry.signature ?? entry.name
  return (
    <Signature code={code} tokens={await highlight(code, 'ts')} description={entry.description} />
  )
}
