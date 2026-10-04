import { Code } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

/** Doc comments use backticks for code. Render those, and keep everything else as text. */
export function inlineCode(text: string): ReactNode[] {
  return text
    .split(/(`[^`]+`)/g)
    .map((part, index) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
        <Code key={index}>{part.slice(1, -1)}</Code>
      ) : (
        part
      ),
    )
}
