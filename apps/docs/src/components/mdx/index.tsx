import type { MDXComponents } from 'mdx/types'
import { Callout } from './client'
import { Anchor, ApiSignature, ApiTable, Example, Pre } from './components'

/** Everything an MDX page can use without importing it. */
export function getMDXComponents(): MDXComponents {
  return {
    pre: Pre,
    a: Anchor,
    Example,
    ApiTable,
    ApiSignature,
    Callout,
  }
}
