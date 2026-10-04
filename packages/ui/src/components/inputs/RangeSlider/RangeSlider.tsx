import { forwardRef, useId } from 'react'
import { useControllableValue, useFocusLeave } from '#components/inputs/CheckboxGroup/choice'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import type { SliderProps } from '#components/inputs/Slider'
import { SliderBase } from '#components/inputs/Slider/SliderBase'

export interface RangeSliderProps extends Omit<
  SliderProps,
  'value' | 'defaultValue' | 'onValueChange' | 'onValueCommit'
> {
  /** Controlled `[low, high]`. */
  value?: readonly [number, number]
  /** Initial `[low, high]` when uncontrolled. Defaults to `[min, max]`. */
  defaultValue?: readonly [number, number]
  onValueChange?: (value: [number, number]) => void
  onValueCommit?: (value: [number, number]) => void
  /** How many steps the thumbs must stay apart. Default 0 (they may meet). */
  minStepsBetweenThumbs?: number
  /** Accessible names of the two thumbs. Default `['Minimum', 'Maximum']`. */
  thumbLabels?: readonly [string, string]
}

const DEFAULT_THUMB_LABELS = ['Minimum', 'Maximum'] as const

/**
 * A low–high range on one track ("Price range": £500–£5,000). The wrapper is a
 * `role="group"` labelled by the surrounding `<Field>` (see `RangeSliderField`) or
 * `aria-label`; each thumb is a `role="slider"` named by `thumbLabels`. The ref and `id`
 * go to the group. `onBlur` fires once, when focus leaves both thumbs.
 *
 * <RangeSlider aria-label="Price range" min={500} max={5000} step={100} defaultValue={[1000, 2500]} showValue
 *   formatOptions={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }} />
 */
export const RangeSlider = markFieldAware(
  forwardRef<HTMLSpanElement, RangeSliderProps>(function RangeSlider(
    {
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      minStepsBetweenThumbs = 0,
      thumbLabels = DEFAULT_THUMB_LABELS,
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
    const [current, setCurrent] = useControllableValue<readonly [number, number]>(
      value,
      defaultValue ?? [min, max],
      onValueChange &&
        ((next) => {
          onValueChange([next[0], next[1]])
        }),
      field.readOnly,
    )
    const handleBlur = useFocusLeave(onBlur)
    const toTuple = (next: number[]): [number, number] => [next[0] ?? min, next[1] ?? max]

    const thumbState = {
      'aria-invalid': field.invalid || undefined,
      'aria-readonly': field.readOnly || undefined,
      'aria-busy': field.busy || undefined,
    } as const

    return (
      // aria-invalid on the group as well as each thumb, like CheckboxGroup: the error belongs to the range.
      // eslint-disable-next-line jsx-a11y/role-supports-aria-props
      <SliderBase
        ref={ref}
        id={field.id}
        role="group"
        aria-labelledby={labelledByProp ?? (rest['aria-label'] ? undefined : field.labelId)}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        {...rest}
        onBlur={handleBlur}
        values={current}
        onValuesChange={(next) => {
          setCurrent(toTuple(next))
        }}
        onValuesCommit={(next) => onValueCommit?.(toTuple(next))}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
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
          { id: `${autoId}min`, 'aria-label': thumbLabels[0], ...thumbState },
          { id: `${autoId}max`, 'aria-label': thumbLabels[1], ...thumbState },
        ]}
      />
    )
  }),
)
