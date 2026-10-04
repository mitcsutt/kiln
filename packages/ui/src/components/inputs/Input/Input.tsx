import {
  forwardRef,
  useRef,
  type InputHTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { useMergedRefs } from '#components/inputs/internal/refs'
import control from '#components/inputs/internal/control.module.css'
import styles from './Input.module.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size
  /** Content inside the box before the text: an icon, "$", a unit. Decorative unless it's a button. */
  leading?: ReactNode
  /** Content inside the box after the text: "AUD", "kg", a clear button. */
  trailing?: ReactNode
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /**
   * Money and quantities: tabular figures in the theme's numeric face, right-aligned so
   * decimals line up. Defaults `inputMode` to `decimal`.
   */
  numeric?: boolean
  /** The native `size` attribute (character width), since `size` is the control size. */
  htmlSize?: number
}

/**
 * Single-line text input. Native props (`value`, `onChange`, `type`, `name`…) go to the
 * `<input>`, as does the ref; `className`/`style` go to the visible box around it.
 *
 * <Input numeric leading="$" trailing="AUD" placeholder="0.00" />
 */
export const Input = markFieldAware(
  forwardRef<HTMLInputElement, InputProps>(function Input(
    {
      size = 'md',
      leading,
      trailing,
      invalid: invalidProp,
      numeric = false,
      htmlSize,
      id: idProp,
      disabled: disabledProp,
      required: requiredProp,
      readOnly,
      inputMode,
      className,
      style,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null)
    const composedRef = useMergedRefs(ref, inputRef)
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly,
    })

    // Clicking the padding or a text adornment focuses the input, like one native control.
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement
      if (target === inputRef.current || target.closest('button, a, input, select, textarea'))
        return
      event.preventDefault()
      inputRef.current?.focus()
    }

    return (
      <div
        className={cx(control.box, styles.root, className)}
        style={style}
        data-size={size}
        data-numeric={numeric || undefined}
        data-invalid={field.invalid || undefined}
        data-disabled={field.disabled || undefined}
        data-readonly={field.readOnly || undefined}
        onPointerDown={onPointerDown}
      >
        {leading != null ? (
          <span className={styles.adornment} data-slot="leading">
            {leading}
          </span>
        ) : null}
        <input
          ref={composedRef}
          id={field.id}
          className={styles.input}
          size={htmlSize}
          disabled={field.disabled}
          readOnly={field.readOnly}
          required={requiredProp ?? field.required}
          inputMode={inputMode ?? (numeric ? 'decimal' : undefined)}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          aria-required={field.required || undefined}
          aria-busy={field.busy || undefined}
          {...rest}
        />
        {trailing != null ? (
          <span className={styles.adornment} data-slot="trailing">
            {trailing}
          </span>
        ) : null}
      </div>
    )
  }),
)
