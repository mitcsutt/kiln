import { highlight } from '@mitcsutt/kiln-ui/highlight'
import type { MDXComponents } from 'mdx/types'
import NextLink from 'next/link'
import { isValidElement, type ComponentProps, type ReactNode } from 'react'
import { Code } from './Code.tsx'
import { Variant } from './Variant.tsx'

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/**
 * Fenced code: ```` ```tsx title="app/layout.tsx" ````. It's highlighted here, on the server, with
 * `@mitcsutt/kiln-ui/highlight`, so the browser downloads no highlighter (ADR 0035).
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

/** A link: a client-side one to the site's own pages, and a plain one to anything else. */
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
 * What every page can use without importing it: code blocks, links and `<Variant>` blocks. A
 * site's own components go in `createDocsSite({ components })`, and win over these.
 */
export const defaultComponents: MDXComponents = { pre: Pre, a: Anchor, Variant }
