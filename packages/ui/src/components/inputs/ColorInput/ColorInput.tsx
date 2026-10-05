import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
} from 'react'
import { RadioGroup } from 'radix-ui'
import { cx } from '#utils/cx'
import { Input, type InputProps } from '#components/inputs/Input'
import { markFieldAware, useResolvedField } from '#components/inputs/internal/FieldContext'
import { normaliseHex } from './colorFormat'
import styles from './ColorInput.module.css'

export interface ColorSwatch {
  /** Any `#rgb` / `#rrggbb`; emitted normalised (`#rrggbb`, lowercase). */
  value: string
  /** The colour's name, read by assistive tech and shown on hover ("Coral"). Required. */
  label: string
}

export interface ColorInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'leading'
> {
  /** `#rrggbb` (lowercase), or `''` when empty. */
  value?: string
  defaultValue?: string
  onValueChange?: (hex: string) => void
  /** Preset colours, shown as a row of swatch radios under the input. */
  swatches?: readonly ColorSwatch[]
  /** Only the swatches — no hex input or picker (a label colour from a fixed palette). */
  swatchesOnly?: boolean
  /** Accessible name of the native colour picker button. Default `'Choose colour'`. */
  pickerLabel?: string
  /** Accessible name appended to the field label for the swatch group. Default `'presets'`. */
  swatchesLabel?: string
}

/**
 * A colour as a hex code: a native colour picker as the leading swatch, the `#rrggbb`
 * text after it (normalised on blur — `#ABC` becomes `#aabbcc`), and optional named
 * preset swatches as a radio group. The ref goes to the hex input (or, with
 * `swatchesOnly`, to the swatch group); `name` submits the hex.
 *
 * <ColorInput swatches={[{ value: '#ff6b57', label: 'Coral' }]} value={colour} onValueChange={setColour} />
 */
export const ColorInput = markFieldAware(
  forwardRef<HTMLElement, ColorInputProps>(function ColorInput(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      swatches,
      swatchesOnly = false,
      pickerLabel = 'Choose colour',
      swatchesLabel = 'presets',
      name,
      form,
      size = 'md',
      id: idProp,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
      invalid,
      className,
      style,
      onBlur,
      onFocus,
      onKeyDown,
      'aria-describedby': describedByProp,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const field = useResolvedField({
      id: idProp,
      describedBy: describedByProp,
      invalid,
      ariaInvalid,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      required: requiredProp,
    })
    const autoId = useId()
    const rootRef = useRef<HTMLDivElement>(null)
    const swatchesLabelId = `${autoId}swatches`
    const isControlled = valueProp !== undefined
    const [internal, setInternal] = useState(() => normaliseHex(defaultValue ?? '') ?? '')
    const value = isControlled ? (normaliseHex(valueProp) ?? valueProp) : internal
    const [draft, setDraft] = useState(value)
    const [editing, setEditing] = useState(false)

    useEffect(() => {
      if (!editing) setDraft(value)
    }, [value, editing])

    const editable = !field.disabled && !field.readOnly

    const setValue = (next: string) => {
      if (!isControlled) setInternal(next)
      if (next !== value) onValueChange?.(next)
    }

    const commit = () => {
      const text = draft.trim()
      if (text === '') {
        setValue('')
        setDraft('')
        return
      }
      const hex = normaliseHex(text)
      if (hex) setValue(hex)
      setDraft(hex ?? value)
    }

    const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value
      setDraft(text)
      const hex = /^#?[0-9a-f]{6}$/i.test(text.trim()) ? normaliseHex(text) : null
      if (hex) setValue(hex)
      else if (text.trim() === '') setValue('')
    }

    // Blur fires once focus leaves the whole control (picker, text, swatches).
    const leftControl = (event: FocusEvent<HTMLElement>) =>
      !(event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget))

    const handleTextBlur = (event: FocusEvent<HTMLInputElement>) => {
      commit()
      setEditing(false)
      if (leftControl(event)) onBlur?.(event)
    }
    const handleOtherBlur = (event: FocusEvent<HTMLElement>) => {
      // Same event, typed for the input's handler: the target is the picker or a swatch.
      if (leftControl(event)) onBlur?.(event as unknown as FocusEvent<HTMLInputElement>)
    }

    const matching = swatches?.find((s) => normaliseHex(s.value) === value)
    // With swatches only, the Field label points at the swatch a Tab would land on.
    const labelTarget = normaliseHex((matching ?? swatches?.[0])?.value ?? '')
    // Swatches only, with a value no swatch matches (saved data, a retired colour): no radio is
    // checked, so a hidden input submits it instead — and the radios get no name, so it's never
    // submitted twice. A non-empty value satisfies `required`, so the radios drop that too.
    const offPalette = swatchesOnly && value !== '' && !matching
    const swatchGroup =
      swatches && swatches.length > 0 ? (
        <RadioGroup.Root
          ref={swatchesOnly ? (ref as Ref<HTMLDivElement>) : undefined}
          className={styles.swatches}
          orientation="horizontal"
          loop
          value={matching ? (normaliseHex(matching.value) ?? '') : ''}
          onValueChange={(next) => {
            if (editable) setValue(next)
          }}
          disabled={field.disabled}
          // Swatches only: the radios themselves submit `name` and carry `required` (Radix
          // renders named native radios inside a form). Otherwise the hex input does.
          name={swatchesOnly && !offPalette ? name : undefined}
          required={swatchesOnly && !offPalette ? field.required : undefined}
          aria-required={swatchesOnly ? field.required || undefined : undefined}
          // Swatches only: the group *is* the control, named by the Field label alone. Beside the
          // hex input it is a second control, "Label colour presets".
          aria-labelledby={
            field.labelId
              ? swatchesOnly
                ? field.labelId
                : `${field.labelId} ${swatchesLabelId}`
              : swatchesLabelId
          }
          aria-describedby={swatchesOnly ? field.describedBy : undefined}
          aria-invalid={swatchesOnly ? field.invalid || undefined : undefined}
          aria-readonly={field.readOnly || undefined}
          aria-busy={swatchesOnly ? field.busy || undefined : undefined}
          onBlur={handleOtherBlur}
        >
          <span id={swatchesLabelId} hidden>
            {swatchesLabel}
          </span>
          {swatches.map((swatch) => {
            const hex = normaliseHex(swatch.value) ?? swatch.value
            return (
              <RadioGroup.Item
                key={hex}
                value={hex}
                id={swatchesOnly && hex === labelTarget ? field.id : undefined}
                className={styles.swatch}
                aria-label={swatch.label}
                title={swatch.label}
                data-readonly={field.readOnly || undefined}
                // The swatch colour is data, not styling — the one place a raw colour renders.
                style={{ '--_swatch': hex } as CSSProperties}
              />
            )
          })}
        </RadioGroup.Root>
      ) : null

    if (swatchesOnly) {
      return (
        <div
          ref={rootRef}
          className={cx(styles.root, className)}
          style={style}
          data-size={size}
          data-swatches-only=""
        >
          {swatchGroup}
          {offPalette && name != null ? (
            <input type="hidden" name={name} form={form} value={value} disabled={field.disabled} />
          ) : null}
        </div>
      )
    }

    return (
      <div ref={rootRef} className={cx(styles.root, className)} style={style} data-size={size}>
        <Input
          ref={ref as Ref<HTMLInputElement>}
          {...rest}
          className={styles.box}
          id={idProp}
          size={size}
          numeric={false}
          type="text"
          name={name}
          form={form}
          disabled={disabledProp}
          readOnly={readOnlyProp}
          required={requiredProp}
          invalid={invalid}
          aria-describedby={describedByProp}
          aria-invalid={ariaInvalid}
          maxLength={7}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={rest.placeholder ?? '#rrggbb'}
          value={draft}
          onChange={handleTextChange}
          onFocus={(event) => {
            setEditing(true)
            onFocus?.(event)
          }}
          onBlur={handleTextBlur}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            onKeyDown?.(event)
            if (!event.defaultPrevented && event.key === 'Enter') commit()
          }}
          leading={
            <span className={styles.picker} data-empty={value === '' || undefined}>
              <input
                type="color"
                className={styles.pickerInput}
                aria-label={pickerLabel}
                value={value || '#000000'}
                disabled={!editable}
                tabIndex={field.readOnly ? -1 : undefined}
                onChange={(event) => {
                  setValue(event.target.value.toLowerCase())
                }}
                onBlur={handleOtherBlur}
              />
            </span>
          }
        />
        {swatchGroup}
      </div>
    )
  }),
)
