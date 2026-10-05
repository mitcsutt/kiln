import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Switch as RadixSwitch } from 'radix-ui'
import { cx } from '#utils/cx'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import styles from './Switch.module.css'

export interface SwitchProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixSwitch.Root>,
  'asChild'
> {
  size?: 'sm' | 'md'
  /** Inline label after the switch. Omit inside a `<Field>` or when labelling another way. */
  label?: ReactNode
  /** Critical border + `aria-invalid`. Rare — a switch usually can't be wrong. */
  invalid?: boolean
  /** Focusable but not editable: sets `aria-readonly` and ignores toggling. */
  readOnly?: boolean
}

/**
 * An on-off setting that takes effect at once.
 *
 * @remarks
 * `Switch` is for a setting that applies immediately, like turning alerts on. For a choice that's
 * submitted with a form, a checkbox says more clearly that nothing happens until you submit.
 * `label` puts a label beside it; inside a settings list, use {@link SwitchField | SwitchField}.
 *
 * @privateRemarks
 * An on/off setting that applies immediately (Radix Switch). For a choice that's
 * submitted with a form, prefer a checkbox. The ref and `className` go to the switch.
 *
 * <Switch label="Repeats monthly" checked={recurring} onCheckedChange={setRecurring} />
 */
export const Switch = markFieldAware(
  forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
    {
      size = 'md',
      label,
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
    const autoId = useId()
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const id = field.id ?? (label != null ? autoId : undefined)

    const control = (
      <RadixSwitch.Root
        ref={ref}
        id={id}
        className={cx(styles.switch, className)}
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
        <RadixSwitch.Thumb className={styles.thumb} />
      </RadixSwitch.Root>
    )

    if (label == null) return control
    return (
      <span className={styles.wrapper} data-disabled={field.disabled || undefined}>
        {control}
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </span>
    )
  }),
)
