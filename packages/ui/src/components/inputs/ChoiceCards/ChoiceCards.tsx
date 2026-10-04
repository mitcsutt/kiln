import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import { Checkbox as RadixCheckbox, RadioGroup as RadixRadioGroup } from 'radix-ui'
import { CheckIcon } from '#icons'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import {
  hiddenInputs,
  useControllableValue,
  useFocusLeave,
  type ChoiceOption,
} from '#components/inputs/CheckboxGroup/choice'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { joinIds } from '#components/inputs/internal/refs'
import styles from './ChoiceCards.module.css'

export interface ChoiceCardOption extends ChoiceOption {
  /** A figure or short fact set at the foot of the card — `<Amount value={10} />`, "Most picked". */
  meta?: ReactNode
}

export type ChoiceCardsColumns = 1 | 2 | 3 | 4

interface ChoiceCardsBaseProps {
  options: readonly ChoiceCardOption[]
  /** Fixed column count, 1–4. Responsive. Default: as many ~12rem cards as fit. */
  columns?: Responsive<ChoiceCardsColumns>
  /** Emits one hidden input per selected value, for native form submission. */
  name?: string
  disabled?: boolean
  /** Focusable but not editable: selection changes are ignored. */
  readOnly?: boolean
  /** Critical edge on the unselected cards + `aria-invalid`. Set for you inside a `<Fieldset error>`. */
  invalid?: boolean
}

export interface ChoiceCardsSingleProps {
  /** One card — the cards are radios (arrow keys move and select; one tab stop). */
  type: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export interface ChoiceCardsMultipleProps {
  /** Any number of cards — the cards are checkboxes (each a tab stop; Space toggles). */
  type: 'multiple'
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
}

export type ChoiceCardsProps = ChoiceCardsBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'dir'> &
  (ChoiceCardsSingleProps | ChoiceCardsMultipleProps)

const EMPTY: readonly string[] = []
const tracks = (n: ChoiceCardsColumns): string => `repeat(${String(n)}, minmax(0, 1fr))`

function CardBody({
  option,
  ids,
  kind,
}: {
  option: ChoiceCardOption
  ids: CardIds
  kind: 'radio' | 'checkbox'
}) {
  return (
    <>
      <span className={styles.head}>
        <span id={ids.label} className={styles.label}>
          {option.label}
        </span>
        <span className={styles.mark} data-kind={kind} aria-hidden="true">
          {kind === 'checkbox' ? <CheckIcon className={styles.check} /> : null}
        </span>
      </span>
      {option.description != null ? (
        <span id={ids.description} className={styles.description}>
          {option.description}
        </span>
      ) : null}
      {option.meta != null ? (
        <span id={ids.meta} className={styles.meta}>
          {option.meta}
        </span>
      ) : null}
    </>
  )
}

interface CardIds {
  label: string
  description: string
  meta: string
}

function cardIds(base: string, index: number): CardIds {
  return {
    label: `${base}card${String(index)}-label`,
    description: `${base}card${String(index)}-description`,
    meta: `${base}card${String(index)}-meta`,
  }
}

/** The card is named by its label and described by its description and meta. */
function cardAria(option: ChoiceCardOption, ids: CardIds) {
  return {
    'aria-labelledby': ids.label,
    'aria-describedby': joinIds(
      option.description != null && ids.description,
      option.meta != null && ids.meta,
    ),
  }
}

/**
 * Choices as cards — for a handful of options that each need a sentence or a figure to
 * choose between ("Plan": £5 / £10 / £20). The whole card is the hit target; the
 * selected card takes the accent edge and nothing else.
 *
 * `type="single"` — Radix RadioGroup; the cards are the radios.
 * `type="multiple"` — each card is a checkbox inside a `role="group"`.
 *
 * Label it with a `<Fieldset legend>` (see `ChoiceCardsField`), a `<Field>` or `aria-label`.
 * `onBlur` fires once, when focus leaves the whole set.
 *
 * <ChoiceCards type="single" aria-label="Plan" name="plan" options={plans} columns={{ base: 1, sm: 3 }} />
 */
export const ChoiceCards = markFieldAware(
  forwardRef<HTMLDivElement, ChoiceCardsProps>(function ChoiceCards(props, ref) {
    const {
      type,
      value: valueProp,
      defaultValue,
      onValueChange,
      options,
      columns,
      name,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      invalid: invalidProp,
      id: idProp,
      className,
      style,
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

    const rootProps = {
      ref,
      id: field.id,
      className: cx(styles.cards, className),
      style: mergeStyles(responsiveVars('choice-cards-columns', columns, tracks), style),
      'data-type': type,
      'data-columns': columns !== undefined || undefined,
      'data-invalid': field.invalid || undefined,
      'data-disabled': field.disabled || undefined,
      'data-readonly': field.readOnly || undefined,
      'aria-labelledby': labelledByProp ?? (rest['aria-label'] ? undefined : field.groupLabelId),
      'aria-describedby': field.describedBy,
      'aria-invalid': field.invalid || undefined,
      'aria-busy': field.busy || undefined,
      onBlur: handleBlur,
      ...rest,
    }

    if (type === 'single') {
      return (
        <RadixRadioGroup.Root
          {...rootProps}
          value={values[0] ?? ''}
          onValueChange={(v) => {
            setValues(v ? [v] : EMPTY)
          }}
          disabled={field.disabled}
          aria-required={field.required || undefined}
          aria-readonly={field.readOnly || undefined}
        >
          {options.map((o, i) => {
            const ids = cardIds(autoId, i)
            return (
              <RadixRadioGroup.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className={styles.card}
                {...cardAria(o, ids)}
              >
                <CardBody option={o} ids={ids} kind="radio" />
              </RadixRadioGroup.Item>
            )
          })}
          {hiddenInputs(name, values, field.disabled)}
        </RadixRadioGroup.Root>
      )
    }

    return (
      <div role="group" {...rootProps}>
        {options.map((o, i) => {
          const ids = cardIds(autoId, i)
          const checked = values.includes(o.value)
          return (
            <RadixCheckbox.Root
              key={o.value}
              checked={checked}
              disabled={field.disabled || o.disabled}
              aria-readonly={field.readOnly || undefined}
              className={styles.card}
              {...cardAria(o, ids)}
              onCheckedChange={(state) => {
                const on = state === true
                // Keep option order, whatever order the cards were picked in.
                setValues(
                  options
                    .map((x) => x.value)
                    .filter((v) => (v === o.value ? on : values.includes(v))),
                )
              }}
            >
              <CardBody option={o} ids={ids} kind="checkbox" />
            </RadixCheckbox.Root>
          )
        })}
        {hiddenInputs(name, values, field.disabled)}
      </div>
    )
  }),
)
