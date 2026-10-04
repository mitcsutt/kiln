import { isValidElement, type ComponentProps, type ReactNode } from 'react'
import NextLink from 'next/link'
import { examples } from '../../../.generated/examples'
import { getApi } from '@/lib/api'
import { getExampleSource } from '@/lib/examples'
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

/** Fenced code: ```tsx title="app/layout.tsx". Kiln's CodeBlock is unhighlighted on purpose. */
export function Pre({ children }: ComponentProps<'pre'>) {
  const code = isValidElement<{ className?: string; 'data-title'?: string }>(children)
    ? children
    : undefined
  const language = code?.props.className?.replace(/^language-/, '')
  return <Code code={textOf(children)} language={language} title={code?.props['data-title']} />
}

export function Anchor({ href = '', children, ...rest }: ComponentProps<'a'>) {
  if (href.startsWith('/') || href.startsWith('#')) {
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

/** A live example from `examples/<name>.tsx`, with its source underneath. */
export function Example({ name, layout }: { name: string; layout?: PreviewLayout }) {
  const Component = examples[name]
  if (!Component) throw new Error(`No example at examples/${name}.tsx`)
  return (
    <Preview code={getExampleSource(name)} layout={layout}>
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
export function ApiSignature({ of }: { of: string }) {
  const entry = getApi(of)
  return <Signature code={entry.signature ?? entry.name} description={entry.description} />
}
