const PASSED_KEYS = [
  'label',
  'description',
  'hint',
  'optional',
  'labelHidden',
  'layout',
  'size',
  'className',
  'style',
  'title',
] as const

type Passed = (typeof PASSED_KEYS)[number]

const PASSED = new Set<PropertyKey>(PASSED_KEYS)

/**
 * The props of a text-input date or time field that still mean something on a kiln-ui picker: the
 * label props, the control size, the wrapper's `className`/`style`, and `aria-*`/`data-*`
 * attributes. A native input's own props (`placeholder`, `leading`, `autoComplete`, input event
 * handlers) have no `<input>` to land on, so they stay behind.
 */
export function pickerFieldProps<P extends object>(props: P): Pick<P, Extract<keyof P, Passed>> {
  const picked: Partial<Record<keyof P, unknown>> = {}
  for (const key of Object.keys(props) as (keyof P & string)[]) {
    if (PASSED.has(key) || key.startsWith('aria-') || key.startsWith('data-'))
      picked[key] = props[key]
  }
  return picked as Pick<P, Extract<keyof P, Passed>>
}
