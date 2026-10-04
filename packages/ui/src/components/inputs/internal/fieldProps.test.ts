import type { FieldLabelProps } from '#components/inputs/Field'
import { FIELD_LABEL_PROP_KEYS, splitFieldLabelProps } from './fieldProps'

// Compile-time exhaustiveness: fails to typecheck if `FieldLabelProps` gains a key that
// `FIELD_LABEL_PROP_KEYS` doesn't list.
type Exhaustive = keyof FieldLabelProps extends (typeof FIELD_LABEL_PROP_KEYS)[number]
  ? true
  : never
export const exhaustive: Exhaustive = true

describe('splitFieldLabelProps', () => {
  it('lists every FieldLabelProps key exactly once', () => {
    expect(new Set(FIELD_LABEL_PROP_KEYS).size).toBe(FIELD_LABEL_PROP_KEYS.length)
  })

  it('splits label props from control props', () => {
    const onValueChange = vi.fn()
    const [fieldProps, rest] = splitFieldLabelProps({
      label: 'Amount',
      description: 'Include GST',
      warning: 'Looks high',
      errorLive: false,
      readOnly: true,
      layout: 'horizontal' as const,
      value: '10',
      onValueChange,
      leading: '$',
    })
    expect(fieldProps).toEqual({
      label: 'Amount',
      description: 'Include GST',
      warning: 'Looks high',
      errorLive: false,
      readOnly: true,
      layout: 'horizontal',
    })
    expect(rest).toEqual({ value: '10', onValueChange, leading: '$' })
  })

  it('omits keys that were never present rather than setting them to undefined', () => {
    const [fieldProps] = splitFieldLabelProps({ label: 'Amount' })
    expect('error' in fieldProps).toBe(false)
    expect('required' in fieldProps).toBe(false)
  })
})
