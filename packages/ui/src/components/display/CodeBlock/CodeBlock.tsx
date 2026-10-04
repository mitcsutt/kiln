import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { CheckIcon, CopyIcon } from '#icons'
import { Button } from '#components/actions/Button'
import { cx } from '#utils/cx'
import styles from './CodeBlock.module.css'

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The source, verbatim. Trailing newlines are trimmed. */
  code: string
  /** Shown as a label ("TypeScript", "bash"). No syntax highlighting — the code is the design. */
  language?: string
  /** Filename or caption shown in the header: `src/queries/keys.ts`. */
  title?: ReactNode
  /** Number the lines in a gutter (not copied with a selection). */
  showLineNumbers?: boolean
  /** 1-based line numbers to mark with the theme's highlight colour. */
  highlightLines?: number[]
  /** Show a copy button. Default `true`. */
  copyable?: boolean
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean
  /** Accessible name of the copy button. Default "Copy code". */
  copyLabel?: string
}

type CopyState = 'idle' | 'copied' | 'failed'

/**
 * A block of source: a snippet in a blog post, a command in a README, a config example.
 * A plain surface with an optional filename bar — no fake window chrome.
 *
 * <CodeBlock title="queries/keys.ts" language="TypeScript" code={source} highlightLines={[3, 4]} />
 */
export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language,
    title,
    showLineNumbers = false,
    highlightLines,
    copyable = true,
    wrap = false,
    copyLabel = 'Copy code',
    className,
    ...rest
  },
  ref,
) {
  const [copy, setCopy] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const captionId = useId()
  const source = code.replace(/\n+$/, '')
  const lines = source.split('\n')
  const highlighted = new Set(highlightLines)
  const hasHeader = Boolean(title) || Boolean(language) || copyable

  useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    [],
  )

  const onCopy = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(source)
      setCopy('copied')
    } catch {
      setCopy('failed')
    }
    timer.current = setTimeout(() => {
      setCopy('idle')
    }, 2000)
  }

  return (
    <figure
      ref={ref}
      className={cx(styles.codeBlock, className)}
      data-kiln-component=""
      data-wrap={wrap || undefined}
      data-line-numbers={showLineNumbers || undefined}
      aria-labelledby={title ? captionId : undefined}
      {...rest}
    >
      {hasHeader ? (
        <figcaption className={styles.header}>
          {title ? (
            <span id={captionId} className={styles.title}>
              {title}
            </span>
          ) : null}
          {language ? <span className={styles.language}>{language}</span> : null}
          {copyable ? (
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              className={styles.copy}
              leadingIcon={copy === 'copied' ? <CheckIcon /> : <CopyIcon />}
              aria-label={copyLabel}
              onClick={() => {
                void onCopy()
              }}
              data-state={copy}
            >
              {copy === 'copied' ? 'Copied' : copy === 'failed' ? 'Copy failed' : 'Copy'}
            </Button>
          ) : null}
        </figcaption>
      ) : null}
      {/* A scrollable region must be reachable by keyboard. */}
      <pre className={styles.pre} tabIndex={0}>
        <code className={styles.code}>
          {lines.map((line, i) => (
            <span
              key={i}
              className={styles.line}
              data-line={showLineNumbers ? i + 1 : undefined}
              data-highlighted={highlighted.has(i + 1) || undefined}
            >
              {line}
              {i < lines.length - 1 ? '\n' : null}
            </span>
          ))}
        </code>
      </pre>
      {copyable ? (
        <span className={styles.visuallyHidden} role="status" aria-live="polite">
          {copy === 'copied' ? 'Copied to clipboard' : copy === 'failed' ? 'Copy failed' : ''}
        </span>
      ) : null}
    </figure>
  )
})
