import { forwardRef, useId, useMemo, type FieldsetHTMLAttributes, type ReactNode } from 'react'
import { cx } from '#utils/cx'
import { FieldContext, type FieldControlContext } from '#components/inputs/internal/FieldContext'
import {
  FieldDescription,
  FieldError,
  FieldWarning,
  LabelContent,
} from '#components/inputs/internal/messages'
import { hasError, hasErrorMessage } from '#components/inputs/internal/errors'
import messageStyles from '#components/inputs/internal/messages.module.css'
import { joinIds } from '#components/inputs/internal/refs'
import type { FieldLayout } from '#components/inputs/Field'
import styles from './Fieldset.module.css'

export type FieldsetVariant = 'default' | 'section'

export interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** The group's name — "Plan", "Notify me about". */
  legend: ReactNode
  description?: ReactNode
  /** A message about the group as a whole ("Choose at least one"). */
  error?: ReactNode
  /** Visual mark after the legend. Put `required` on the controls (or RadioGroup) too. */
  required?: boolean
  optional?: boolean | string
  legendHidden?: boolean
  /**
   * `default` — the legend reads like a field label (a radio group, a checkbox set).
   * `section` — the legend is set as a small heading with a hairline under it, for a
   * form broken into groups of fields ("Your details", "Payment"), so groups read as
   * groups rather than as one more label.
   */
  variant?: FieldsetVariant
  /** Non-blocking advice about the group as a whole. Hidden while an error message is shown. */
  warning?: ReactNode
  /** Whether the error message is `role="alert"`. Default `true`. */
  errorLive?: boolean
  /** Keeps the invalid state but doesn't render the error text. */
  errorHidden?: boolean
  /** Shows a small spinner after the legend and sets `aria-busy` on every control inside. */
  validating?: boolean
  /** Every control inside sets native `readOnly`/`aria-readonly` and ignores changes. */
  readOnly?: boolean
  /**
   * Same values as `Field`'s `layout`. `stack` (default) puts the legend above the group;
   * `horizontal` puts it in a label column beside the group from `sm` up (matching a
   * horizontal `Field`), stacking below; `inline` hides the legend (like `legendHidden`).
   */
  layout?: FieldLayout
}

/**
 * Groups related controls under one legend, with a description and an error for the group.
 *
 * @remarks
 * `Fieldset` is a `<fieldset>` and `<legend>` with Kiln's styles: an address block, a set of
 * checkboxes, a radio group. Screen readers announce the legend with each control inside, so
 * "Town" becomes "Delivery address, Town".
 *
 * @privateRemarks
 * Groups related controls under a legend: a RadioGroup, a set of CheckboxFields, or an
 * address block. `disabled` disables every control inside (native fieldset behaviour).
 *
 * <Fieldset legend="Plan" description="Pay by card or bank transfer">
 *   <RadioGroup …/>
 * </Fieldset>
 *
 * <Fieldset variant="section" legend="Your details">…TextFields…</Fieldset>
 */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset(
  {
    legend,
    description,
    error,
    required = false,
    optional,
    legendHidden = false,
    variant = 'default',
    warning,
    errorLive = true,
    errorHidden = false,
    validating = false,
    readOnly = false,
    layout = 'stack',
    className,
    children,
    'aria-describedby': describedByProp,
    ...rest
  },
  ref,
) {
  const id = useId()
  const legendId = `${id}legend`
  const descriptionId = `${id}description`
  const warningId = `${id}warning`
  const errorId = `${id}error`
  const showErrorMessage = hasErrorMessage(error) && !errorHidden
  const showWarning = warning != null && !showErrorMessage
  const invalid = hasError(error)
  const disabled = rest.disabled ?? false
  const effectiveLegendHidden = legendHidden || layout === 'inline'

  const context = useMemo<FieldControlContext>(
    () => ({
      id,
      labelId: legendId,
      invalid,
      required,
      disabled,
      readOnly,
      busy: validating,
      warningId,
      fieldset: true,
    }),
    [id, legendId, invalid, required, disabled, readOnly, validating, warningId],
  )

  return (
    <fieldset
      ref={ref}
      className={cx(styles.fieldset, className)}
      data-variant={variant}
      data-layout={layout}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      aria-describedby={joinIds(
        describedByProp,
        description != null && descriptionId,
        showWarning && warningId,
        showErrorMessage && errorId,
      )}
      {...rest}
    >
      <legend
        id={legendId}
        className={cx(
          messageStyles.label,
          styles.legend,
          effectiveLegendHidden && messageStyles.visuallyHidden,
        )}
        data-disabled={disabled || undefined}
      >
        <LabelContent required={required} optional={optional} busy={validating}>
          {legend}
        </LabelContent>
      </legend>
      <div className={styles.body}>
        {description != null ? (
          <FieldDescription id={descriptionId} className={styles.description}>
            {description}
          </FieldDescription>
        ) : null}
        <div className={styles.controls}>
          <FieldContext.Provider value={context}>{children}</FieldContext.Provider>
        </div>
        {showWarning ? <FieldWarning id={warningId}>{warning}</FieldWarning> : null}
        {showErrorMessage ? (
          <FieldError id={errorId} live={errorLive}>
            {error}
          </FieldError>
        ) : null}
      </div>
    </fieldset>
  )
})
