import { forwardRef, useId, useState } from 'react'
import { cx } from '#utils/cx'
import { Switch, type SwitchProps } from '#components/inputs/Switch'
import type { FieldLabelProps } from '#components/inputs/Field'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import {
  FieldDescription,
  FieldError,
  FieldWarning,
  LabelContent,
} from '#components/inputs/internal/messages'
import { hasError, hasErrorMessage } from '#components/inputs/internal/errors'
import messageStyles from '#components/inputs/internal/messages.module.css'
import { joinIds } from '#components/inputs/internal/refs'
import styles from './SwitchField.module.css'

export interface SwitchFieldProps
  extends FieldLabelProps, Omit<SwitchProps, 'label' | 'invalid' | keyof FieldLabelProps> {}

/**
 * A settings row, with the label and its help on one side and the switch on the other.
 *
 * @remarks
 * `SwitchField` is the row you'd find in a settings list: the label and its description on the
 * left, the {@link Switch | Switch} on the right, an error underneath. The whole label is part of
 * the target.
 *
 * @privateRemarks
 * A settings row: the label and its help on the left, the switch on the right, an error
 * line underneath. For a setting that applies as soon as it's flipped; for a choice that
 * is submitted with a form, a CheckboxField reads better. The ref goes to the switch,
 * `className`/`style` to the row.
 *
 * <SwitchField label="Email me when a payment is due" description="Three days before" checked={on} onCheckedChange={setOn} />
 */
export const SwitchField = forwardRef<HTMLButtonElement, SwitchFieldProps>(
  function SwitchField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const {
      label,
      description,
      hint,
      error,
      required = false,
      optional,
      labelHidden = false,
      warning,
      errorLive = true,
      errorHidden = false,
      validating = false,
      readOnly = false,
    } = fieldProps
    const {
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      id: idProp,
      disabled = false,
      className,
      style,
      'aria-describedby': describedByProp,
      ...switchRest
    } = rest

    const autoId = useId()
    const id = idProp ?? `${autoId}switch`
    const labelId = `${id}-label`
    const descriptionId = `${id}-description`
    const warningId = `${id}-warning`
    const errorId = `${id}-error`
    const help = description ?? hint
    const showErrorMessage = hasErrorMessage(error) && !errorHidden
    const showWarning = warning != null && !showErrorMessage

    // Always controlled underneath, so `readOnly` holds even when the caller is uncontrolled.
    const [internal, setInternal] = useState(defaultChecked)
    const checked = checkedProp ?? internal
    const handleCheckedChange = (next: boolean) => {
      if (readOnly) return
      if (checkedProp === undefined) setInternal(next)
      onCheckedChange?.(next)
    }

    return (
      <div
        className={cx(styles.root, className)}
        style={style}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
      >
        <div className={styles.text}>
          <label
            id={labelId}
            htmlFor={id}
            className={cx(styles.label, labelHidden && messageStyles.visuallyHidden)}
          >
            <LabelContent required={required} optional={optional} busy={validating}>
              {label}
            </LabelContent>
          </label>
          {help != null ? <FieldDescription id={descriptionId}>{help}</FieldDescription> : null}
        </div>
        <span className={styles.slot}>
          <Switch
            ref={ref}
            id={id}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            invalid={hasError(error)}
            aria-required={required || undefined}
            aria-busy={validating || undefined}
            aria-describedby={joinIds(
              describedByProp,
              help != null && descriptionId,
              showWarning && warningId,
              showErrorMessage && errorId,
            )}
            checked={checked}
            onCheckedChange={handleCheckedChange}
            {...switchRest}
          />
        </span>
        {showWarning ? (
          <FieldWarning id={warningId} className={styles.message}>
            {warning}
          </FieldWarning>
        ) : null}
        {showErrorMessage ? (
          <FieldError id={errorId} className={styles.message} live={errorLive}>
            {error}
          </FieldError>
        ) : null}
      </div>
    )
  },
)
