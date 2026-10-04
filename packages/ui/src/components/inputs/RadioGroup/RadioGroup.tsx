import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { RadioGroup as RadixRadioGroup } from 'radix-ui'
import { cx } from '#utils/cx'
import type { Size } from '#utils/tokens'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { joinIds } from '#components/inputs/internal/refs'
import messageStyles from '#components/inputs/internal/messages.module.css'
import styles from './RadioGroup.module.css'

export interface RadioGroupProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>,
  'asChild'
> {
  size?: Size
  /** Critical border on every radio + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  /** Focusable but not editable: sets `aria-readonly` and ignores selection changes. */
  readOnly?: boolean
}

/**
 * One choice from a short list (Radix RadioGroup: arrow keys move, one tab stop).
 * Label the group with a `<Fieldset legend>`, a `<Field label>` or `aria-label`.
 *
 * <RadioGroup defaultValue="20" orientation="horizontal">
 *   <RadioGroup.Item value="10" label="$10" />
 *   <RadioGroup.Item value="20" label="$20" />
 * </RadioGroup>
 */
const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    size = 'md',
    invalid: invalidProp,
    orientation = 'vertical',
    disabled: disabledProp,
    readOnly: readOnlyProp,
    onValueChange,
    className,
    'aria-describedby': describedByProp,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': labelledByProp,
    ...rest
  },
  ref,
) {
  // A group is labelled by reference, so it takes the Field's label id rather than its id.
  const field = useResolvedField({
    describedBy: describedByProp,
    invalid: invalidProp,
    ariaInvalid,
    disabled: disabledProp,
    readOnly: readOnlyProp,
  })
  return (
    <RadixRadioGroup.Root
      ref={ref}
      className={cx(styles.group, className)}
      orientation={orientation}
      data-orientation={orientation}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-readonly={field.readOnly || undefined}
      disabled={field.disabled}
      aria-labelledby={labelledByProp ?? field.groupLabelId}
      aria-readonly={field.readOnly || undefined}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      aria-required={field.required || undefined}
      aria-busy={field.busy || undefined}
      onValueChange={field.readOnly ? undefined : onValueChange}
      {...rest}
    />
  )
})

export interface RadioGroupItemProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>,
  'asChild'
> {
  /** Visible label beside the radio. Omit only if you supply `aria-label`. */
  label?: ReactNode
  /** Secondary line under the label, linked with `aria-describedby`. */
  description?: ReactNode
}

/** One option. The ref and `className` go to the radio button itself. */
const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(function RadioGroupItem(
  { label, description, id: idProp, className, 'aria-describedby': describedByProp, ...rest },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? `${autoId}radio`
  const descriptionId = `${id}-description`
  const radio = (
    <RadixRadioGroup.Item
      ref={ref}
      id={id}
      className={cx(styles.radio, className)}
      aria-describedby={joinIds(describedByProp, description != null && descriptionId)}
      {...rest}
    >
      <RadixRadioGroup.Indicator className={styles.dot} />
    </RadixRadioGroup.Item>
  )
  if (label == null) return radio
  return (
    <div className={styles.item} data-disabled={rest.disabled ? true : undefined}>
      <span className={styles.slot}>{radio}</span>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {description != null ? (
          <span id={descriptionId} className={messageStyles.description}>
            {description}
          </span>
        ) : null}
      </span>
    </div>
  )
})

export const RadioGroup = markFieldAware(Object.assign(RadioGroupRoot, { Item: RadioGroupItem }))
