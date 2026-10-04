import { forwardRef, useId, type CSSProperties } from 'react'
import { cx } from '#utils/cx'
import { Checkbox, type CheckboxProps } from '#components/inputs/Checkbox'
import type { FieldLabelProps } from '#components/inputs/Field'
import { splitFieldLabelProps } from '#components/inputs/internal/fieldProps'
import {
  FieldDescription,
  FieldError,
  FieldWarning,
  LabelContent,
} from '#components/inputs/internal/messages'
import { hasError, hasErrorMessage } from '#components/inputs/internal/errors'
import { joinIds } from '#components/inputs/internal/refs'
import styles from './CheckboxField.module.css'

export interface CheckboxFieldProps
  extends
    FieldLabelProps,
    Omit<
      CheckboxProps,
      | 'checked'
      | 'defaultChecked'
      | 'onCheckedChange'
      | 'invalid'
      | 'className'
      | 'style'
      | keyof FieldLabelProps
    > {
  /** `'indeterminate'` shows a dash — for a "select all" over a partly-selected list. */
  checked?: boolean | 'indeterminate'
  defaultChecked?: boolean | 'indeterminate'
  /** Called with a plain boolean (an indeterminate box becomes `true` when clicked). */
  onCheckedChange?: (checked: boolean) => void
  /** Goes to the wrapper; the ref goes to the checkbox. */
  className?: string
  style?: CSSProperties
}

/**
 * A checkbox with its label to the right, optional help underneath and an error line.
 *
 * <CheckboxField label="I've read the house rules" error={errors.rules} />
 */
export const CheckboxField = forwardRef<HTMLButtonElement, CheckboxFieldProps>(
  function CheckboxField(props, ref) {
    const [fieldProps, rest] = splitFieldLabelProps(props)
    const {
      label,
      description,
      hint,
      error,
      required = false,
      optional,
      warning,
      errorLive = true,
      errorHidden = false,
      validating = false,
      readOnly,
    } = fieldProps
    const {
      onCheckedChange,
      id: idProp,
      disabled,
      className,
      style,
      'aria-describedby': describedByProp,
      ...restProps
    } = rest

    const autoId = useId()
    const id = idProp ?? `${autoId}checkbox`
    const descriptionId = `${id}-description`
    const warningId = `${id}-warning`
    const errorId = `${id}-error`
    const help = description ?? hint
    const showErrorMessage = hasErrorMessage(error) && !errorHidden
    const showWarning = warning != null && !showErrorMessage

    return (
      <div
        className={cx(styles.root, className)}
        style={style}
        data-disabled={disabled ? true : undefined}
        data-readonly={readOnly ? true : undefined}
      >
        <span className={styles.slot}>
          <Checkbox
            ref={ref}
            id={id}
            disabled={disabled}
            readOnly={readOnly}
            invalid={hasError(error)}
            aria-required={required || undefined}
            aria-busy={validating || undefined}
            aria-describedby={joinIds(
              describedByProp,
              help != null && descriptionId,
              showWarning && warningId,
              showErrorMessage && errorId,
            )}
            onCheckedChange={
              onCheckedChange
                ? (state) => {
                    onCheckedChange(state === true)
                  }
                : undefined
            }
            {...restProps}
          />
        </span>
        <div className={styles.text}>
          <label htmlFor={id} className={styles.label}>
            <LabelContent required={required} optional={optional} busy={validating}>
              {label}
            </LabelContent>
          </label>
          {help != null ? <FieldDescription id={descriptionId}>{help}</FieldDescription> : null}
        </div>
        {showWarning ? (
          <FieldWarning id={warningId} className={styles.error}>
            {warning}
          </FieldWarning>
        ) : null}
        {showErrorMessage ? (
          <FieldError id={errorId} className={styles.error} live={errorLive}>
            {error}
          </FieldError>
        ) : null}
      </div>
    )
  },
)
