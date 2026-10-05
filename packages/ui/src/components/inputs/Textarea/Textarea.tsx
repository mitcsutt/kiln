import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type TextareaHTMLAttributes,
} from 'react'
import { cx } from '#utils/cx'
import { mergeStyles } from '#utils/responsive'
import type { Size } from '#utils/tokens'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import control from '#components/inputs/internal/control.module.css'
import styles from './Textarea.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: Size
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /**
   * Grow with the content instead of scrolling. `rows` becomes the minimum height and
   * `maxRows` the cap. Uses CSS `field-sizing: content`, with a small script fallback.
   */
  autoResize?: boolean
  /** With `autoResize`: stop growing after this many rows and scroll instead. */
  maxRows?: number
}

function supportsFieldSizing(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('field-sizing', 'content')
  )
}

/**
 * Multi-line text in the same box as Input, growing with its content if you let it.
 *
 * @remarks
 * `Textarea` shares Input's box, states and focus ring. `autoResize` grows it with its content
 * from `rows` up to `maxRows`, then it scrolls. For a labelled textarea with a character count,
 * use {@link TextareaField | TextareaField}.
 *
 * @privateRemarks
 * Multi-line text. Same box, states and focus ring as `Input`.
 *
 * <Textarea autoResize rows={2} maxRows={8} />
 */
export const Textarea = markFieldAware(
  forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    {
      size = 'md',
      invalid: invalidProp,
      autoResize = false,
      rows = 3,
      maxRows,
      id: idProp,
      disabled: disabledProp,
      required: requiredProp,
      readOnly,
      className,
      style,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null)
    const composedRef = useMergedRefs(ref, innerRef)
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly,
    })

    // Fallback for browsers without field-sizing: size to scrollHeight on every input.
    useEffect(() => {
      const el = innerRef.current
      if (!autoResize || !el || supportsFieldSizing()) return
      const fit = () => {
        el.style.height = 'auto'
        const border = el.offsetHeight - el.clientHeight
        el.style.height = `${String(el.scrollHeight + border)}px`
      }
      fit()
      el.addEventListener('input', fit)
      return () => {
        el.removeEventListener('input', fit)
      }
    }, [autoResize, rest.value])

    return (
      <textarea
        ref={composedRef}
        id={field.id}
        rows={rows}
        className={cx(control.box, styles.textarea, className)}
        style={mergeStyles(
          autoResize ? ({ '--_rows': rows, '--_max-rows': maxRows } as CSSProperties) : undefined,
          style,
        )}
        data-size={size}
        data-auto-resize={autoResize || undefined}
        data-max-rows={autoResize && maxRows ? '' : undefined}
        data-invalid={field.invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        disabled={field.disabled}
        readOnly={field.readOnly}
        required={requiredProp ?? field.required}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        aria-required={field.required || undefined}
        aria-busy={field.busy || undefined}
        {...rest}
      />
    )
  }),
)
