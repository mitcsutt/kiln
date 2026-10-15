import { forwardRef, useState, type ReactNode } from 'react'
import { CheckIcon, CopyIcon } from '#icons'
import { cx } from '#utils/cx'
import { Button, type ButtonProps } from '#components/actions/Button'
import { IconButton } from '#components/actions/IconButton'
import { Tooltip } from '#components/overlays/Tooltip'
import { useClipboard } from './useClipboard'
import styles from './CopyButton.module.css'

/** What a `CopyButton` render function receives. */
export interface CopyButtonRenderProps {
  /** Copy `value` now. */
  copy: () => void
  /** `true` for `timeout` ms after a successful copy. */
  copied: boolean
  /** Why the last copy failed, for `timeout` ms after it. */
  error: Error | null
}

export interface CopyButtonProps extends Omit<
  ButtonProps,
  'value' | 'children' | 'onCopy' | 'onError' | 'leadingIcon' | 'trailingIcon' | 'asChild'
> {
  /** The text to copy, or a function that returns it when the button is pressed. */
  value: string | (() => string)
  /** The button's name, and its tooltip. Say what it copies: "Copy link". Default "Copy". */
  label?: string
  /** Shown for a moment after a copy. Default "Copied". */
  copiedLabel?: string
  /** Shown for a moment when a copy fails. Default "Couldn’t copy". */
  failedLabel?: string
  /** Show `label` as text beside the glyph, instead of an icon-only button with a tooltip. */
  showLabel?: boolean
  /** What screen readers hear after a copy. Default "Copied to clipboard". */
  announcement?: string
  /** How long the copied state lasts, in ms. Default `1500`. */
  timeout?: number
  /** Called with the copied text: raise a toast, log an event. */
  onCopy?: (text: string) => void
  /** Called when the copy fails. */
  onError?: (error: Error) => void
  /**
   * Your own trigger instead of the button: a function that gets `copy`, `copied` and `error`.
   * The announcement for screen readers is still rendered for you.
   */
  children?: (state: CopyButtonRenderProps) => ReactNode
}

/**
 * A button that copies text, says so, and swaps its glyph to a check for a moment.
 *
 * @remarks
 * `CopyButton` copies a link, an ID, a command or a token. By default it's an icon-only
 * {@link IconButton | IconButton} with a tooltip that reads "Copy", then "Copied". `showLabel`
 * makes it a {@link Button | Button} with the words beside the glyph. `value` can be a function,
 * to compute the text at the moment of the press (say, serialising the current state).
 *
 * Screen readers hear "Copied to clipboard" through a polite live region, and the button keeps its
 * name. If the copy fails, the button and the announcement say so, and `onError` gets the reason.
 * On a page without the Clipboard API, such as one served over plain HTTP, it falls back to the
 * older way of copying, so it works wherever copying can.
 *
 * For a trigger of your own, pass a function as `children`, or use {@link useClipboard |
 * useClipboard} directly.
 *
 * @privateRemarks
 * Built on useClipboard, which CodeBlock's copy button uses too, so there's one copy path. The
 * tooltip is held open while `copied` is set, because Radix closes it on the press itself.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  {
    value,
    label = 'Copy',
    copiedLabel = 'Copied',
    failedLabel = 'Couldn’t copy',
    showLabel = false,
    announcement = 'Copied to clipboard',
    timeout = 1500,
    onCopy,
    onError,
    children,
    onClick,
    className,
    variant = 'ghost',
    tone = 'neutral',
    size,
    ...rest
  },
  ref,
) {
  const { copy, copied, error } = useClipboard({ timeout, onCopy, onError })
  const [hintOpen, setHintOpen] = useState(false)
  const state = copied ? 'copied' : error ? 'failed' : 'idle'
  const shown = copied ? copiedLabel : error ? failedLabel : label
  const run = () => {
    void copy(value)
  }
  const status = (
    <span className={styles.status} role="status">
      {copied ? announcement : error ? failedLabel : ''}
    </span>
  )

  if (children) {
    return (
      <>
        {children({ copy: run, copied, error })}
        {status}
      </>
    )
  }

  const press: ButtonProps['onClick'] = (event) => {
    onClick?.(event)
    if (!event.defaultPrevented) run()
  }
  const glyph = copied ? <CheckIcon /> : <CopyIcon />

  return (
    <>
      {showLabel ? (
        <Button
          ref={ref}
          variant={variant}
          tone={tone}
          size={size}
          className={cx(styles.copyButton, className)}
          leadingIcon={glyph}
          data-state={state}
          onClick={press}
          {...rest}
        >
          {shown}
        </Button>
      ) : (
        <Tooltip content={shown} open={hintOpen || state !== 'idle'} onOpenChange={setHintOpen}>
          <IconButton
            ref={ref}
            variant={variant}
            tone={tone}
            size={size}
            className={cx(styles.copyButton, className)}
            label={label}
            icon={glyph}
            data-state={state}
            onClick={press}
            {...rest}
          />
        </Tooltip>
      )}
      {status}
    </>
  )
})
