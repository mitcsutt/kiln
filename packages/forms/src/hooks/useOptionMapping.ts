import { useMemo } from 'react'
import type { FieldOption, Primitive } from '#kit/contracts'

/** Item value used for an `emptyOption` row; maps back to `null`. Never a real option value. */
export const EMPTY_OPTION_VALUE = '__repo-forms-empty__'

/** An option as `@mitcsutt/kiln-ui` controls take it: string values only. */
export interface UiOption {
  value: string
  label: string
  description?: string
  group?: string
  keywords?: readonly string[]
  disabled?: boolean
}

export interface OptionMapping<V extends Primitive> {
  /** Options with string values (+ the `emptyOption` row first, when given). */
  uiOptions: UiOption[]
  /**
   * Field value → ui value. `null`/`undefined`/unknown → `''` (Radix shows the placeholder). A
   * `retain`ed value maps through even when it isn't among the current options.
   */
  toUi: (value: V | null | undefined) => string
  /** Ui value → field value with its original primitive type; `''`, the empty row or unknown → `null`. */
  fromUi: (value: string) => V | null
  /** The label of a field value, for view mode. */
  labelOf: (value: V | null | undefined) => string | undefined
}

/**
 * Maps typed option values (`1`, `true`, `'gbp'`) to the strings Radix-based ui controls use, and
 * back, losslessly (§7.3). Keys are `String(value)`; one shared helper for every option field.
 */
export interface OptionMappingOptions<V extends Primitive> {
  /** A leading "none" row whose ui value maps back to `null`. */
  emptyOption?: string
  /**
   * Values that must survive a round trip even when the current `options` don't contain them —
   * the field's selected values while an async search shows other results. They
   * map to `String(value)` and back to the original typed value; they add no ui option rows
   * (the ui control keeps their labels itself).
   */
  retain?: readonly (V | null | undefined)[]
  /** Options seen earlier (older loader results): consulted for values not in `options`. */
  known?: ReadonlyMap<string, FieldOption<V>>
}

export function createOptionMapping<V extends Primitive>(
  options: readonly FieldOption<V>[] | undefined,
  opts: OptionMappingOptions<V> = {},
): OptionMapping<V> {
  const byKey = new Map<string, FieldOption<V>>()
  const retained = new Map<string, V>()
  for (const value of opts.retain ?? []) {
    if (value !== null && value !== undefined) retained.set(String(value), value)
  }
  const uiOptions: UiOption[] = []
  if (opts.emptyOption !== undefined)
    uiOptions.push({ value: EMPTY_OPTION_VALUE, label: opts.emptyOption })
  for (const option of options ?? []) {
    const key = String(option.value)
    byKey.set(key, option)
    const ui: UiOption = { value: key, label: option.label }
    if (option.description !== undefined) ui.description = option.description
    if (option.group !== undefined) ui.group = option.group
    if (option.keywords !== undefined) ui.keywords = option.keywords
    if (option.disabled !== undefined) ui.disabled = option.disabled
    uiOptions.push(ui)
  }
  return {
    uiOptions,
    toUi: (value) => {
      if (value === null || value === undefined) return ''
      const key = String(value)
      return byKey.has(key) || retained.has(key) ? key : ''
    },
    fromUi: (value) => {
      if (value === '' || value === EMPTY_OPTION_VALUE) return null
      const option = byKey.get(value) ?? opts.known?.get(value)
      if (option) return option.value
      return retained.get(value) ?? null
    },
    labelOf: (value) => {
      if (value === null || value === undefined) return undefined
      const key = String(value)
      return (byKey.get(key) ?? opts.known?.get(key))?.label
    },
  }
}

/**
 * Hook form of `createOptionMapping`, memoised on the options array and `emptyOption` (and
 * `retain`/`known` by identity — pass stable references).
 */
export function useOptionMapping<V extends Primitive>(
  options: readonly FieldOption<V>[] | undefined,
  opts: OptionMappingOptions<V> = {},
): OptionMapping<V> {
  const { emptyOption, retain, known } = opts
  return useMemo(
    () =>
      createOptionMapping(options, {
        ...(emptyOption !== undefined ? { emptyOption } : {}),
        ...(retain !== undefined ? { retain } : {}),
        ...(known !== undefined ? { known } : {}),
      }),
    [options, emptyOption, retain, known],
  )
}
