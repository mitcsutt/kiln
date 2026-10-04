import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '#utils/cx'
import styles from './Code.module.css'

export type CodeTone = 'neutral' | 'accent'

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  /** `accent` only when the snippet is the thing being talked about. Default `neutral`. */
  tone?: CodeTone
}

/**
 * Inline code: a token, a command, a file name. Sized relative to the surrounding
 * text so it sits on the same line in a heading or a caption. For blocks, use CodeBlock.
 *
 * Run <Code>pnpm --filter @mitcsutt/kiln-ui test</Code> before pushing.
 */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { tone = 'neutral', className, ...rest },
  ref,
) {
  return (
    <code
      ref={ref}
      className={cx(styles.code, className)}
      data-kiln-component=""
      data-tone={tone}
      {...rest}
    />
  )
})
