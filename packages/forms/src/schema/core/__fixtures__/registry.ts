/**
 * Test-only: a type-level field registry shaped like the full §7.2 catalogue (so schema typing is
 * exercised independently of the shipped field components) and its kit extras. No runtime components — the
 * schema core never renders.
 */
import type {
  ExactContract,
  FieldDef,
  FieldOption,
  OptionContract,
  OptionsContract,
  Primitive,
} from '#core/kit/contracts'
import { defineComputer, defineLoader, defineValidator } from '#schema/core/registry'
import type { Computer, NamedValidator, OptionsLoader } from '#schema/core/types'

/** Props every field shares (the subset of FieldLabelProps / CommonFieldProps that matters here). */
interface Shared {
  label: string
  description?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  layout?: 'stack' | 'horizontal' | 'inline'
  /** Function props never reach JSON. */
  onBlur?: (event: unknown) => void
}
interface WithWarn<V> extends Shared {
  warn?: (value: V) => string | null | undefined
}
interface Options<B extends Primitive> {
  options?: readonly FieldOption<B>[]
}

type Exact<V, P> = FieldDef<ExactContract<V>, P>

export interface TestRegistry {
  text: Exact<
    string,
    WithWarn<string> & {
      type?: 'text' | 'email' | 'tel' | 'url' | 'search'
      autoComplete?: string
      placeholder?: string
      maxLength?: number
    }
  >
  password: Exact<string, Shared & { autoComplete: 'current-password' | 'new-password' }>
  textarea: Exact<string, Shared & { rows?: number; maxLength?: number; showCount?: boolean }>
  number: Exact<number, Shared & { min?: number; max?: number; step?: number }>
  amount: Exact<
    number,
    Shared & { currency: string; unit?: 'major' | 'minor'; allowNegative?: boolean }
  >
  select: FieldDef<
    OptionContract<Primitive>,
    Shared & Options<Primitive> & { placeholder?: string; emptyOption?: string }
  >
  combobox: FieldDef<
    OptionContract<string | number>,
    Shared & Options<string | number> & { clearable?: boolean; creatable?: boolean }
  >
  multiSelect: FieldDef<
    OptionsContract<string | number>,
    Shared & Options<string | number> & { maxSelected?: number }
  >
  radio: FieldDef<
    OptionContract<Primitive>,
    Shared & Options<Primitive> & { orientation?: 'horizontal' | 'vertical' }
  >
  segmented: FieldDef<
    OptionContract<string | number>,
    Shared & Options<string | number> & { fullWidth?: boolean }
  >
  choiceCards: FieldDef<
    OptionContract<string | number>,
    Shared & Options<string | number> & { columns?: 1 | 2 | 3 }
  >
  checkbox: Exact<boolean, Shared>
  switch: Exact<boolean, Shared>
  checkboxGroup: FieldDef<
    OptionsContract<string | number>,
    Shared & Options<string | number> & { columns?: 1 | 2 | 3 }
  >
  chips: FieldDef<OptionsContract<string | number>, Shared & Options<string | number>>
  slider: Exact<number, Shared & { min?: number; max?: number; step?: number; showValue?: boolean }>
  range: Exact<
    readonly [number, number],
    Shared & {
      min?: number
      max?: number
      step?: number
      formatOptions?: { style?: 'currency' | 'decimal'; currency?: string }
    }
  >
  rating: Exact<number, Shared & { max?: number }>
  date: Exact<string, Shared & { min?: string; max?: string }>
  time: Exact<string, Shared & { step?: number }>
  dateTime: Exact<string, Shared>
  dateRange: Exact<
    { start: string; end: string },
    Shared & { startLabel?: string; endLabel?: string }
  >
  oneTimeCode: Exact<string, Shared & { length?: number; submitOnComplete?: boolean }>
  color: Exact<string, Shared & { swatches?: readonly { value: string; label: string }[] }>
  tags: Exact<readonly string[], Shared & { maxTags?: number }>
  hidden: Exact<string, { label?: string }>
}

/** A custom node component's shape (render-side `defineCustomNode` returns something like this). */
type TeamPreview = (props: { props: { teamId: string; compact?: boolean } }) => null

export interface TestExtras {
  loaders: { teams: OptionsLoader<string>; merchants: OptionsLoader<string> }
  validators: { uniqueEmail: NamedValidator<string>; ukPostcode: NamedValidator<string> }
  computers: { remainder: Computer<number> }
  nodes: { teamPreview: TeamPreview }
}

export const testLoaders = {
  teams: defineLoader<string>(() =>
    Promise.resolve([{ value: 'riverside', label: 'Riverside Rovers' }]),
  ),
  merchants: defineLoader<string>(() =>
    Promise.resolve([{ value: 'northgate', label: 'Northgate Stationers' }]),
  ),
}

export const testValidators = {
  uniqueEmail: defineValidator<string>(
    (value, { signal }) =>
      new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve(value === 'taken@example.com' ? 'That email is already entered' : null)
        }, 5)
        signal?.addEventListener('abort', () => {
          clearTimeout(timer)
        })
      }),
    { async: true },
  ),
  ukPostcode: defineValidator<string>((value) =>
    /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(value)
      ? null
      : 'Enter a full UK postcode, like SW1A 1AA',
  ),
}

export const testComputers = {
  remainder: defineComputer((values) => {
    const v = values as { amount?: number | null; splits?: readonly { amount: number | null }[] }
    return (v.amount ?? 0) - (v.splits ?? []).reduce((sum, split) => sum + (split.amount ?? 0), 0)
  }),
}

/** Registry names for `parseFormSchema`. */
export const testRegistryNames = {
  kinds: [
    'text',
    'password',
    'textarea',
    'number',
    'amount',
    'select',
    'combobox',
    'multiSelect',
    'radio',
    'segmented',
    'choiceCards',
    'checkbox',
    'switch',
    'checkboxGroup',
    'chips',
    'slider',
    'range',
    'rating',
    'date',
    'time',
    'dateTime',
    'dateRange',
    'oneTimeCode',
    'color',
    'tags',
    'hidden',
  ] satisfies readonly (keyof TestRegistry)[],
  loaders: testLoaders,
  validators: testValidators,
  computers: testComputers,
  nodes: ['teamPreview'],
}
