import { isValidElement, type ComponentProps, type ReactNode } from 'react'
import { highlight } from '@mitcsutt/kiln-ui/highlight'
import NextLink from 'next/link'
import { examples } from '../../../.generated/examples'
import { getApi } from '@/lib/api'
import { exampleId, getExampleSource } from '@/lib/examples'
import { Code } from './Code'
import { Preview, type PreviewLayout } from './Preview'
import { PropsTable } from './PropsTable'
import { Signature } from './client'

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/**
 * Fenced code: ```tsx title="app/layout.tsx". JavaScript and TypeScript are highlighted here, on
 * the server, so the browser downloads no highlighter.
 */
export async function Pre({ children }: ComponentProps<'pre'>) {
  const code = isValidElement<{ className?: string; 'data-title'?: string }>(children)
    ? children
    : undefined
  const language = code?.props.className?.replace(/^language-/, '')
  const source = textOf(children)
  return (
    <Code
      code={source}
      language={language}
      title={code?.props['data-title']}
      tokens={language ? await highlight(source, language) : undefined}
    />
  )
}

/** A file such as `/llms.txt` or `/docs/ui.md`: the static export has no page payload to prefetch. */
const FILE_PATH = /\.[a-z]+(?:[?#]|$)/

export function Anchor({ href = '', children, ...rest }: ComponentProps<'a'>) {
  if ((href.startsWith('/') && !FILE_PATH.test(href)) || href.startsWith('#')) {
    return (
      <NextLink href={href} {...rest}>
        {children}
      </NextLink>
    )
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}

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

/** The props of one or more types, generated from kiln-ui and kiln-forms source. */
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
