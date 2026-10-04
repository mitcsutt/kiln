import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { MinusIcon, PlusIcon } from '#icons'
import { IconButton } from '#components/actions/IconButton'
import { Input, type InputProps } from '#components/inputs/Input'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { clamp, decimalsOf, formatRaw, parseNumber, roundTo } from './numberFormat'
import styles from './NumberInput.module.css'

export interface NumberInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'inputMode' | 'numeric' | 'min' | 'max' | 'step'
> {
  /** The number, or `null` when empty. Never `NaN`. */
  value?: number | null
  defaultValue?: number | null
  /** Called while typing (on every text that parses), on stepping, and on commit. `null` when cleared. */
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** Arrow-key / button increment. Also sets the rounding precision on commit. Default `1`. */
  step?: number
  /** PageUp / PageDown increment. Default `10 × step`. */
  largeStep?: number
  /** Show − / + buttons at the end of the box (out of the tab order — the keyboard uses arrows). Default `true`. */
  stepper?: boolean
  /** Accessible name of the − button. Default `'Decrease'`. */
  decrementLabel?: string
  /** Accessible name of the + button. Default `'Increase'`. */
  incrementLabel?: string
  /** How the number reads when the field isn't focused (`{ style: 'percent' }`, `{ maximumFractionDigits: 1 }`). */
  formatOptions?: Intl.NumberFormatOptions
  /** Locale for parsing and formatting. Defaults to the browser's. */
  locale?: string
  /** Clamp to `min`/`max` when the typed value is committed (blur, Enter). Default `true`. */
  clampOnBlur?: boolean
}

/**
 * A number typed as text — a WAI-ARIA spinbutton, never `type="number"`. Formatted in the
 * locale when blurred ("1,450.5"), raw while focused ("1450.5"), so editing never fights the
 * grouping. ↑/↓ step, PgUp/PgDn step ×10, Home/End jump to `min`/`max`, Enter commits.
 * The ref goes to the text input; `name` is submitted as a plain number ("1450.5").
 *
 * <NumberInput min={1} max={12} value={guests} onValueChange={setGuests} />
 */
export const NumberInput = markFieldAware(
  forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      largeStep,
      stepper = true,
      decrementLabel = 'Decrease',
      incrementLabel = 'Increase',
      formatOptions,
      locale,
      clampOnBlur = true,
      name,
      form,
      trailing,
      size = 'md',
      id: idProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      invalid,
      'aria-describedby': describedBy,
      'aria-invalid': ariaInvalid,
      onFocus,
      onBlur,
      onKeyDown,
      ...rest
    },
    ref,
  ) {
    const field = useResolvedField({ id: idProp, disabled: disabledProp, readOnly: readOnlyProp })
    const isControlled = valueProp !== undefined
    const [internal, setInternal] = useState<number | null>(defaultValue ?? null)
    const value = isControlled ? valueProp : internal
    const [focused, setFocused] = useState(false)
    const [draft, setDraft] = useState('')

    const scale = formatOptions?.style === 'percent' ? 100 : 1
    const precision =
      Math.max(decimalsOf(step), formatOptions?.maximumFractionDigits ?? 0) +
      (scale === 100 ? 2 : 0)
    const bigStep = largeStep ?? step * 10
    const formatter = useMemo(
      () => new Intl.NumberFormat(locale, formatOptions),
      [locale, formatOptions],
    )
    const display = (v: number | null) => (v == null ? '' : formatter.format(v))
    const raw = (v: number | null) =>
      v == null ? '' : formatRaw(roundTo(v * scale, precision), locale)
    const parse = (text: string): number | null => {
      const n = parseNumber(text, locale)
      return n == null || Number.isNaN(n) ? n : scale === 1 ? n : roundTo(n / scale, precision)
    }

    // An outside change while focused (a form reset, a linked field) replaces the draft.
    useEffect(() => {
      if (!focused) return
      const parsed = parse(draft)
      if (parsed !== value && !(parsed == null && value == null)) setDraft(raw(value))
      // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the value changing
    }, [value])

    const setValue = (next: number | null) => {
      if (!isControlled) setInternal(next)
      if (next !== value) onValueChange?.(next)
    }

    const editable = !field.disabled && !field.readOnly

    const stepBy = (delta: number) => {
      if (!editable) return
      const typed = focused ? parse(draft) : value
      const base = typed == null || Number.isNaN(typed) ? value : typed
      const next =
        base == null ? clamp(0, min, max) : clamp(roundTo(base + delta, precision), min, max)
      setValue(next)
      if (focused) setDraft(raw(next))
    }

    const jumpTo = (target: number | undefined) => {
      if (!editable || target == null) return
      setValue(target)
      if (focused) setDraft(raw(target))
    }

    const commit = () => {
      const parsed = parse(draft)
      if (parsed != null && Number.isNaN(parsed)) {
        setDraft(raw(value))
        return
      }
      const next =
        parsed == null
          ? null
          : clampOnBlur
            ? clamp(roundTo(parsed, precision), min, max)
            : roundTo(parsed, precision)
      setValue(next)
      setDraft(raw(next))
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value
      setDraft(text)
      const parsed = parse(text)
      if (parsed == null || !Number.isNaN(parsed)) setValue(parsed)
    }

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      setDraft(raw(value))
      onFocus?.(event)
    }

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      commit()
      setFocused(false)
      onBlur?.(event)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      const actions: Record<string, () => void> = {
        ArrowUp: () => {
          stepBy(step)
        },
        ArrowDown: () => {
          stepBy(-step)
        },
        PageUp: () => {
          stepBy(bigStep)
        },
        PageDown: () => {
          stepBy(-bigStep)
        },
        Home: () => {
          jumpTo(min)
        },
        End: () => {
          jumpTo(max)
        },
        Enter: commit,
      }
      const action = actions[event.key]
      if (!action) return
      if ((event.key === 'Home' && min == null) || (event.key === 'End' && max == null)) return
      if (event.key !== 'Enter') event.preventDefault()
      action()
    }

    // Keep focus where it is when a stepper button is pressed.
    const keepFocus = (event: MouseEvent) => {
      event.preventDefault()
    }
    // The stepper buttons point at the input, so it always has an id (the Field's when inside one).
    const autoId = useId()
    const controlId = field.id ?? `${autoId}number`

    const buttons = stepper ? (
      <>
        <IconButton
          className={styles.stepper}
          size="sm"
          label={decrementLabel}
          icon={<MinusIcon />}
          tabIndex={-1}
          aria-controls={controlId}
          disabled={!editable || (value != null && min != null && value <= min)}
          onMouseDown={keepFocus}
          onClick={() => {
            stepBy(-step)
          }}
        />
        <IconButton
          className={styles.stepper}
          size="sm"
          label={incrementLabel}
          icon={<PlusIcon />}
          tabIndex={-1}
          aria-controls={controlId}
          disabled={!editable || (value != null && max != null && value >= max)}
          onMouseDown={keepFocus}
          onClick={() => {
            stepBy(step)
          }}
        />
      </>
    ) : null

    const allowsNegative = min == null || min < 0
    const valueText = value == null ? undefined : display(value)

    return (
      <>
        <Input
          ref={ref}
          {...rest}
          id={controlId}
          size={size}
          numeric
          type="text"
          role="spinbutton"
          inputMode={
            allowsNegative ? 'text' : decimalsOf(step) === 0 && scale === 1 ? 'numeric' : 'decimal'
          }
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabledProp}
          readOnly={readOnlyProp}
          invalid={invalid}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid}
          aria-valuenow={value ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={valueText}
          value={focused ? draft : display(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          form={form}
          trailing={
            trailing != null || buttons ? (
              <>
                {trailing}
                {buttons}
              </>
            ) : undefined
          }
        />
        {/* Disabled like the control it stands for: a disabled control submits nothing. */}
        {name != null ? (
          <input
            type="hidden"
            name={name}
            form={form}
            value={value == null ? '' : String(value)}
            disabled={field.disabled}
          />
        ) : null}
      </>
    )
  }),
)
