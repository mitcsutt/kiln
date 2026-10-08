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

/**
 * What a piece of highlighted source is. Each kind is coloured from the theme's own tokens, so
 * highlighted code follows the theme and the colour mode.
 */
export type CodeTokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'constant'
  | 'function'
  | 'type'
  | 'tag'
  | 'attribute'
  | 'punctuation'

/** A run of source text and its kind. A token with no `type` is plain text. */
export interface CodeToken {
  content: string
  type?: CodeTokenType
}

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The source, verbatim. Trailing newlines are trimmed. */
  code: string
  /** Shown as a label ("TypeScript", "bash"). It doesn't turn on highlighting: `tokens` does. */
  language?: string
  /**
   * Syntax highlighting for `code`: one array of tokens per line, as `highlight` from
   * `@mitcsutt/kiln-ui/highlight` returns them. Without it the code is plain.
   */
  tokens?: CodeToken[][]
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
 * A block of source with an optional filename bar, line numbers, highlighted lines and a copy
 * button.
 *
 * @remarks
 * `CodeBlock` shows code: a snippet in an article, a command, a config example. It's a plain
 * surface with an optional title bar, never fake window chrome. It's plain unless you pass
 * `tokens`: `highlight` from `@mitcsutt/kiln-ui/highlight` turns JavaScript, JSX, TypeScript and
 * TSX into tokens, coloured from the theme. Every code sample in these docs is a `CodeBlock`.
 *
 * ## Highlighting
 *
 * `highlight(code, language)` resolves to the tokens for `code`, or to `undefined` for a language
 * other than `js`, `jsx`, `ts` or `tsx` (or `javascript` and `typescript`), which `CodeBlock`
 * shows as plain code. It runs [Shiki](https://shiki.style), an optional peer dependency, so
 * install `shiki` to use it. The main `@mitcsutt/kiln-ui` entry never loads it.
 *
 * Keywords and tags take the accent, strings, constants, functions and types take the theme's
 * tones, and comments and punctuation are muted. A custom theme needs no code palette of its own.
 *
 * The tokens are plain data, so highlight wherever the code is ready. In a server component or
 * at build time, `await` it and pass the tokens to the client component that renders the
 * `CodeBlock`, and the browser downloads no highlighter. In the browser, call it in an effect, as
 * in the example above: Shiki and the grammar load on the first call.
 *
 * ```tsx
 * import { highlight } from '@mitcsutt/kiln-ui/highlight'
 *
 * export async function Snippet({ source }: { source: string }) {
 *   const tokens = await highlight(source, 'tsx')
 *   return <SnippetBlock code={source} tokens={tokens} />
 * }
 * ```
 *
 * @privateRemarks
 * A block of source: a snippet in a blog post, a command in a README, a config example.
 * A plain surface with an optional filename bar — no fake window chrome.
 *
 * <CodeBlock title="queries/keys.ts" language="TypeScript" code={source} highlightLines={[3, 4]} />
 */
export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language,
    tokens,
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
              {tokens?.[i]
                ? tokens[i].map((token, j) =>
                    token.type ? (
                      <span key={j} className={styles.token} data-token={token.type}>
                        {token.content}
                      </span>
                    ) : (
                      token.content
                    ),
                  )
                : line}
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
