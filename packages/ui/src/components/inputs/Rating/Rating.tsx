import { forwardRef, useState, type HTMLAttributes } from 'react'
import { RadioGroup as RadixRadioGroup } from 'radix-ui'
import { StarIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { useControllableValue, useFocusLeave } from '#components/inputs/CheckboxGroup/choice'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import styles from './Rating.module.css'

export interface RatingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'dir'
> {
  /** Controlled rating, `null` for none. */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  /** Number of stars. Default 5. */
  max?: number
  /** Choosing the current rating again clears it (`null`). */
  clearable?: boolean
  /** Each star's accessible name. Default `${n} of ${max}`. */
  itemLabel?: (n: number, max: number) => string
  /** Emits a hidden input with the rating (none when `null`), for native form submission. */
  name?: string
  disabled?: boolean
  /** Focusable but not editable: sets `aria-readonly` and ignores changes. */
  readOnly?: boolean
  /** Critical edge on the empty stars + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  size?: Size
}

const defaultItemLabel = (n: number, max: number) => `${String(n)} of ${String(max)}`

/**
 * A star rating that's one tab stop, with arrow keys to choose and a preview on hover.
 *
 * @remarks
 * `Rating` is a radio group whose radios are stars, so it's one tab stop and the arrow keys move
 * and choose. Stars up to the rating fill with the accent, and hovering previews a rating before
 * you choose. `clearable` lets pressing the chosen star again clear it.
 *
 * @privateRemarks
 * A star rating — a Radix RadioGroup whose radios are stars, so it's one tab stop and the
 * arrow keys move and choose. Stars up to the rating fill with the accent; hovering
 * previews a rating before you choose it. Label it with a `<Field>` (see `RatingField`) or
 * `aria-label`. `onBlur` fires once, when focus leaves the stars.
 *
 * <Rating aria-label="Rate this release" defaultValue={4} clearable />
 */
export const Rating = markFieldAware(
  forwardRef<HTMLDivElement, RatingProps>(function Rating(
    {
      value,
      defaultValue = null,
      onValueChange,
      max = 5,
      clearable = false,
      itemLabel = defaultItemLabel,
      name,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      invalid: invalidProp,
      size = 'md',
      id: idProp,
      className,
      onBlur,
      onPointerLeave,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-labelledby': labelledByProp,
      ...rest
    },
    ref,
  ) {
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const [current, setCurrent] = useControllableValue<number | null>(
      value,
      defaultValue,
      onValueChange,
      field.readOnly,
    )
    const [preview, setPreview] = useState<number | null>(null)
    const handleBlur = useFocusLeave(onBlur)
    const interactive = !field.disabled && !field.readOnly
    const shown = preview ?? current ?? 0
    const stars = Array.from({ length: Math.max(0, Math.floor(max)) }, (_, i) => i + 1)

    return (
      <RadixRadioGroup.Root
        ref={ref}
        id={field.id}
        className={cx(styles.rating, className)}
        value={current === null ? '' : String(current)}
        onValueChange={(v) => {
          setCurrent(v === '' ? null : Number(v))
        }}
        disabled={field.disabled}
        data-size={size}
        data-invalid={field.invalid || undefined}
        data-readonly={field.readOnly || undefined}
        data-previewing={preview !== null || undefined}
        aria-labelledby={labelledByProp ?? (rest['aria-label'] ? undefined : field.labelId)}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        aria-required={field.required || undefined}
        aria-readonly={field.readOnly || undefined}
        aria-busy={field.busy || undefined}
        onBlur={handleBlur}
        onPointerLeave={(event) => {
          setPreview(null)
          onPointerLeave?.(event)
        }}
        {...rest}
      >
        {stars.map((n) => (
          <RadixRadioGroup.Item
            key={n}
            value={String(n)}
            className={styles.star}
            aria-label={itemLabel(n, max)}
            data-filled={n <= shown || undefined}
            onPointerEnter={
              interactive
                ? () => {
                    setPreview(n)
                  }
                : undefined
            }
            onClick={
              clearable
                ? () => {
                    // Radix ignores a click on the checked radio; clearable turns it into "none".
                    if (current === n) setCurrent(null)
                  }
                : undefined
            }
          >
            <StarIcon className={styles.glyph} />
          </RadixRadioGroup.Item>
        ))}
        {name && current !== null ? (
          <input type="hidden" name={name} value={current} disabled={field.disabled || undefined} />
        ) : null}
      </RadixRadioGroup.Root>
    )
  }),
)
