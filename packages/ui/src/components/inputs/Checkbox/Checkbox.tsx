import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Checkbox as RadixCheckbox } from 'radix-ui'
import { CheckIcon, MinusIcon } from '#icons'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import styles from './Checkbox.module.css'

export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixCheckbox.Root>,
  'asChild'
> {
  size?: Size
  /** Critical border + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Focusable but not editable: sets `aria-readonly` and ignores clicks. */
  readOnly?: boolean
}

/**
 * A bare checkbox, including the indeterminate state for "some of these".
 *
 * @remarks
 * `Checkbox` is Radix Checkbox with Kiln's look. `checked` can be `true`, `false` or
 * `'indeterminate'`, for a parent that controls a set where only some are on. It needs a label:
 * use {@link CheckboxField | CheckboxField}, a `Field`, or an `aria-label`.
 *
 * @privateRemarks
 * A bare checkbox (Radix). `checked` may be `'indeterminate'` for a "some selected"
 * parent. Needs a label — use `CheckboxField`, a `<Field>`, or `aria-label`.
 *
 * <Checkbox checked={allPaid ? true : somePaid ? 'indeterminate' : false} onCheckedChange={…} />
 */
export const Checkbox = markFieldAware(
  forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
    {
      size = 'md',
      invalid: invalidProp,
      id: idProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      onCheckedChange,
      className,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
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
    return (
      <RadixCheckbox.Root
        ref={ref}
        id={field.id}
        className={cx(styles.checkbox, className)}
        data-size={size}
        data-invalid={field.invalid || undefined}
        data-readonly={field.readOnly || undefined}
        disabled={field.disabled}
        aria-readonly={field.readOnly || undefined}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        aria-required={field.required || undefined}
        aria-busy={field.busy || undefined}
        onCheckedChange={field.readOnly ? undefined : onCheckedChange}
        {...rest}
      >
        <RadixCheckbox.Indicator className={styles.indicator}>
          <CheckIcon className={styles.check} />
          <MinusIcon className={styles.dash} />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    )
  }),
)
