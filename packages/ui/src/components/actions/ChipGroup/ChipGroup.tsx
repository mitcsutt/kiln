import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import { ToggleGroup } from 'radix-ui'
import { cx } from '#utils/cx'
import chipStyles from '#components/actions/ToggleChip/chip.module.css'
import {
  hiddenInputs,
  useControllableValue,
  useFocusLeave,
  type ChoiceOption,
} from '#components/inputs/CheckboxGroup/choice'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import messageStyles from '#components/inputs/internal/messages.module.css'
import styles from './ChipGroup.module.css'

export interface ChipOption extends ChoiceOption {
  /** A leading glyph. One icon per chip at most — and only when it carries meaning. */
  icon?: ReactNode
  /** How many items the chip matches, in tabular figures after the label. */
  count?: number
}

export type ChipGroupSize = 'sm' | 'md'

interface ChipGroupBaseProps {
  options: readonly ChipOption[]
  size?: ChipGroupSize
  disabled?: boolean
  /** Critical edge on the resting chips + `aria-invalid`. Set for you inside a `<Fieldset error>`. */
  invalid?: boolean
  /** Focusable but not editable: presses are ignored. */
  readOnly?: boolean
  /** Emits one hidden input per selected value, for native form submission. */
  name?: string
}

export interface ChipGroupSingleProps {
  /** One chip at most; pressing the selected chip clears it (`''`). */
  type: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export interface ChipGroupMultipleProps {
  /** Any number of chips. */
  type: 'multiple'
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
}

export type ChipGroupProps = ChipGroupBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'dir'> &
  (ChipGroupSingleProps | ChipGroupMultipleProps)

const EMPTY: readonly string[] = []

function ChipContent({ option }: { option: ChipOption }) {
  return (
    <>
      {option.icon ? (
        <span className={chipStyles.icon} aria-hidden="true">
          {option.icon}
        </span>
      ) : null}
      <span className={chipStyles.label}>{option.label}</span>
      {option.count !== undefined ? <span className={chipStyles.count}>{option.count}</span> : null}
    </>
  )
}

/**
 * A set of chips that together make one answer — "Email alerts", "Labels". The chips look
 * exactly like `ToggleChip` (they share its style module) but behave as a group (Radix
 * ToggleGroup): one tab stop, arrow keys move between chips, Space/Enter presses.
 *
 * `type="multiple"` — any number pressed; chips are toggle buttons in a `role="group"`.
 * `type="single"`   — at most one; chips are radios in a `role="radiogroup"`.
 *
 * Label it with a `<Fieldset legend>` (see `ChipGroupField`), a `<Field>` or `aria-label`.
 * `onBlur` fires once, when focus leaves the whole group.
 *
 * <ChipGroup type="multiple" aria-label="Email alerts" options={alerts} defaultValue={['mentions']} />
 */
export const ChipGroup = markFieldAware(
  forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup(props, ref) {
    const {
      type,
      value: valueProp,
      defaultValue,
      onValueChange,
      options,
      size = 'md',
      disabled: disabledProp,
      invalid: invalidProp,
      readOnly: readOnlyProp,
      name,
      id: idProp,
      className,
      onBlur,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      'aria-labelledby': labelledByProp,
      ...rest
    } = props
    const autoId = useId()
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid: invalidProp,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
    })
    const handleBlur = useFocusLeave(onBlur)

    // Normalise both modes to an array internally.
    const toArray = (v: string | readonly string[] | undefined): readonly string[] | undefined =>
      v === undefined ? undefined : typeof v === 'string' ? (v ? [v] : EMPTY) : v
    const emit = onValueChange
      ? (next: readonly string[]) => {
          if (type === 'single') onValueChange(next[0] ?? '')
          else onValueChange([...next])
        }
      : undefined
    const [values, setValues] = useControllableValue<readonly string[]>(
      toArray(valueProp),
      toArray(defaultValue) ?? EMPTY,
      emit,
      field.readOnly,
    )
    const order = options.map((o) => o.value)

    const items = options.map((o, i) => {
      const descriptionId = `${autoId}chip${String(i)}-description`
      return (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          className={chipStyles.chip}
          data-size={size}
          data-invalid={field.invalid || undefined}
          aria-describedby={o.description != null ? descriptionId : undefined}
        >
          <ChipContent option={o} />
        </ToggleGroup.Item>
      )
    })

    // Descriptions live outside the chips: inside, they'd become part of each chip's name.
    const descriptions = options.some((o) => o.description != null) ? (
      <span className={messageStyles.visuallyHidden}>
        {options.map((o, i) =>
          o.description != null ? (
            <span key={o.value} id={`${autoId}chip${String(i)}-description`}>
              {o.description}
            </span>
          ) : null,
        )}
      </span>
    ) : null

    const common = {
      ref,
      id: field.id,
      className: cx(styles.group, className),
      disabled: field.disabled,
      'data-size': size,
      'data-invalid': field.invalid || undefined,
      'data-readonly': field.readOnly || undefined,
      'aria-labelledby': labelledByProp ?? (rest['aria-label'] ? undefined : field.groupLabelId),
      'aria-describedby': field.describedBy,
      'aria-invalid': field.invalid || undefined,
      'aria-busy': field.busy || undefined,
      onBlur: handleBlur,
      ...rest,
    }

    return type === 'single' ? (
      <ToggleGroup.Root
        {...common}
        type="single"
        role="radiogroup"
        aria-required={field.required || undefined}
        aria-readonly={field.readOnly || undefined}
        value={values[0] ?? ''}
        onValueChange={(v) => {
          setValues(v ? [v] : EMPTY)
        }}
      >
        {items}
        {descriptions}
        {hiddenInputs(name, values, field.disabled)}
      </ToggleGroup.Root>
    ) : (
      <ToggleGroup.Root
        {...common}
        type="multiple"
        role="group"
        value={[...values]}
        onValueChange={(v) => {
          setValues([...v].sort((a, b) => order.indexOf(a) - order.indexOf(b)))
        }}
      >
        {items}
        {descriptions}
        {hiddenInputs(name, values, field.disabled)}
      </ToggleGroup.Root>
    )
  }),
)
