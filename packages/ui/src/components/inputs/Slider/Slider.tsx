import { forwardRef, useId, type HTMLAttributes } from 'react'
import { useControllableValue, useFocusLeave } from '#components/inputs/CheckboxGroup/choice'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { SliderBase, type SliderMark, type SliderSize } from './SliderBase'

export type { SliderMark, SliderSize } from './SliderBase'

export interface SliderProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'onChange' | 'defaultValue' | 'dir'
> {
  /** Controlled value. */
  value?: number
  /** Initial value when uncontrolled. Defaults to `min`. */
  defaultValue?: number
  /** Every change while dragging or stepping. */
  onValueChange?: (value: number) => void
  /** Once, when the user lets go (or after each key press). */
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Labelled stops under the track. A thumb on a mark reads the mark's label. */
  marks?: readonly SliderMark[]
  /** Shows the formatted value beside the track, in tabular figures. */
  showValue?: boolean
  /** Formats the shown value and the thumb's `aria-valuetext` ("£2,500"). */
  formatOptions?: Intl.NumberFormatOptions
  locale?: string
  /** Emits a hidden input with the value, for native form submission. */
  name?: string
  disabled?: boolean
  /** Focusable but not editable: sets `aria-readonly` and ignores changes. */
  readOnly?: boolean
  /** Critical edge on the thumb + `aria-invalid`. Inside a `<Field error>` this is set for you. */
  invalid?: boolean
  size?: SliderSize
}

/**
 * One number from a continuous range (Radix Slider). Arrow keys step, Page Up/Down step
 * by ten, Home/End jump to the ends. Label it with a `<Field>` (see `SliderField`) or
 * `aria-label`. The ref and `id` go to the thumb — the focusable `role="slider"`;
 * `className`/`style` and other props go to the wrapper. `onBlur` fires when focus leaves.
 *
 * <Slider aria-label="Savings rate" defaultValue={20} step={5} showValue formatOptions={{ style: 'unit', unit: 'percent' }} />
 */
export const Slider = markFieldAware(
  forwardRef<HTMLSpanElement, SliderProps>(function Slider(
    {
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      marks,
      showValue = false,
      formatOptions,
      locale,
      name,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      invalid: invalidProp,
      size = 'md',
      id: idProp,
      onBlur,
      'aria-label': ariaLabel,
      'aria-labelledby': labelledByProp,
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
    const [current, setCurrent] = useControllableValue(
      value,
      defaultValue ?? min,
      onValueChange,
      field.readOnly,
    )
    const handleBlur = useFocusLeave(onBlur)

    return (
      <SliderBase
        {...rest}
        onBlur={handleBlur}
        values={[current]}
        onValuesChange={(next) => {
          setCurrent(next[0] ?? min)
        }}
        onValuesCommit={(next) => onValueCommit?.(next[0] ?? min)}
        min={min}
        max={max}
        step={step}
        marks={marks}
        showValue={showValue}
        formatOptions={formatOptions}
        locale={locale}
        name={name}
        disabled={field.disabled}
        readOnly={field.readOnly}
        invalid={field.invalid}
        size={size}
        thumbs={[
          {
            id: field.id ?? `${autoId}thumb`,
            ref,
            'aria-label': ariaLabel,
            'aria-labelledby': labelledByProp ?? (ariaLabel ? undefined : field.labelId),
            'aria-describedby': field.describedBy,
            'aria-invalid': field.invalid || undefined,
            'aria-readonly': field.readOnly || undefined,
            'aria-busy': field.busy || undefined,
          },
        ]}
      />
    )
  }),
)
