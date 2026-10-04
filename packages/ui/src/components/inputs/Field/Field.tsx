import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useMemo,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cx } from '#utils/cx'
import {
  FieldContext,
  isFieldAware,
  type FieldControlContext,
} from '#components/inputs/internal/FieldContext'
import {
  FieldDescription,
  FieldError,
  FieldWarning,
  LabelContent,
} from '#components/inputs/internal/messages'
import { hasError, hasErrorMessage } from '#components/inputs/internal/errors'
import messageStyles from '#components/inputs/internal/messages.module.css'
import { joinIds } from '#components/inputs/internal/refs'
import styles from './Field.module.css'

/** Props handed to a render-function child — spread them onto your control. */
export interface FieldRenderProps {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
  /** The Field's `required`. Spreading it onto a native input also turns on browser validation. */
  required: boolean
  disabled?: boolean
}

/** `Field`'s (and `Fieldset`'s) `layout` values. */
export type FieldLayout = 'stack' | 'horizontal' | 'inline'

/** The label/description/error props every field shares (TextField, SelectField… extend these). */
export interface FieldLabelProps {
  /** Visible label. Keep it short; put guidance in `description`. */
  label: ReactNode
  /** Help text under the label, linked to the control with `aria-describedby`. */
  description?: ReactNode
  /** Alias of `description` (the legacy name). */
  hint?: ReactNode
  /**
   * Validation message. When present the control gets `aria-invalid` and its border (only)
   * turns critical. Pass `true` to mark invalid without a message.
   */
  error?: ReactNode
  /** Shows a mark after the label and sets `aria-required` on the control. */
  required?: boolean
  /** Shows "Optional" after the label (or your own word). Ignored when `required`. */
  optional?: boolean | string
  /** Keep the label for assistive tech only — e.g. a search box beside a visible heading. */
  labelHidden?: boolean
  /**
   * Non-blocking advice ("Usernames are case-sensitive"). Shown under the control in a
   * caution tone, never `role="alert"`. Hidden while an error message is shown.
   */
  warning?: ReactNode
  /**
   * Whether the error message is `role="alert"` (announced as soon as it appears).
   * Default `true`. Pass `false` once a form-level `ErrorSummary` owns the announcement
   * — the message stays in `aria-describedby` either way.
   */
  errorLive?: boolean
  /**
   * Keeps the invalid state (border, `aria-invalid`) but doesn't render the error text —
   * for layouts that show the message elsewhere (a sentence, a table cell).
   */
  errorHidden?: boolean
  /** Shows a small spinner after the label and sets `aria-busy` on the control. */
  validating?: boolean
  /** Focusable but not editable. Controls set native `readOnly`/`aria-readonly`. */
  readOnly?: boolean
  /**
   * `stack` (default) — label above the control.
   * `horizontal` — label/description in one column, the control in another (collapses
   * to a stack below `sm`).
   * `inline` — the label is visually hidden and the control sits in text flow.
   */
  layout?: FieldLayout
}

export interface FieldProps
  extends FieldLabelProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Id for the control. Defaults to the child's own `id`, then a generated one. */
  htmlFor?: string
  /** Disables the control inside and dims the label. */
  disabled?: boolean
  /**
   * The control. Library controls pick the wiring up from context; any other single element
   * gets `id` / `aria-*` cloned in; or pass a function and spread its props yourself.
   */
  children: ReactNode | ((props: FieldRenderProps) => ReactNode)
}

interface ControlElementProps {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: unknown
}

/**
 * Wires a label, description and error to one control.
 *
 * <Field label="Amount" description="Include GST" error={errors.amount}>
 *   <Input numeric leading="$" />
 * </Field>
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
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
    layout = 'stack',
    htmlFor,
    disabled = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const autoId = useId()
  const childProps = isValidElement(children) ? (children.props as ControlElementProps) : undefined
  const id = htmlFor ?? childProps?.id ?? `${autoId}control`
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  const warningId = `${id}-warning`
  const errorId = `${id}-error`

  const help = description ?? hint
  const invalid = hasError(error)
  const showErrorMessage = hasErrorMessage(error) && !errorHidden
  const showWarning = warning != null && !showErrorMessage
  const effectiveLabelHidden = labelHidden || layout === 'inline'
  const describedBy = joinIds(
    help != null && descriptionId,
    showWarning && warningId,
    showErrorMessage && errorId,
  )

  const context = useMemo<FieldControlContext>(
    () => ({
      id,
      labelId,
      describedBy,
      invalid,
      required,
      disabled,
      readOnly,
      busy: validating,
      warningId,
    }),
    [id, labelId, describedBy, invalid, required, disabled, readOnly, validating, warningId],
  )

  let control: ReactNode
  if (typeof children === 'function') {
    control = children({
      id,
      'aria-describedby': describedBy,
      'aria-invalid': invalid || undefined,
      'aria-required': required || undefined,
      required,
      disabled: disabled || undefined,
    })
  } else if (isValidElement(children) && !isFieldAware(children.type)) {
    control = cloneElement(
      children as ReactElement<ControlElementProps & Record<string, unknown>>,
      {
        id,
        'aria-describedby': joinIds(childProps?.['aria-describedby'], describedBy),
        'aria-invalid': invalid
          ? true
          : childProps?.['aria-invalid'] === false
            ? undefined
            : childProps?.['aria-invalid'],
        'aria-required': required || undefined,
      },
    )
  } else {
    control = children
  }

  return (
    <div
      ref={ref}
      className={cx(styles.field, className)}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-label-hidden={effectiveLabelHidden || undefined}
      data-layout={layout}
      {...rest}
    >
      <div className={styles.header}>
        <label
          id={labelId}
          htmlFor={id}
          className={cx(messageStyles.label, effectiveLabelHidden && messageStyles.visuallyHidden)}
        >
          <LabelContent required={required} optional={optional} busy={validating}>
            {label}
          </LabelContent>
        </label>
        {help != null ? <FieldDescription id={descriptionId}>{help}</FieldDescription> : null}
      </div>
      <div className={styles.controlSlot}>
        <FieldContext.Provider value={context}>{control}</FieldContext.Provider>
      </div>
      {showWarning ? (
        <div className={styles.warningSlot}>
          <FieldWarning id={warningId}>{warning}</FieldWarning>
        </div>
      ) : null}
      {showErrorMessage ? (
        <div className={styles.errorSlot}>
          <FieldError id={errorId} live={errorLive}>
            {error}
          </FieldError>
        </div>
      ) : null}
    </div>
  )
})
