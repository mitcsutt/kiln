import { accepts, useFieldBinding } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'

export interface FormHiddenFieldProps {
  /** Not submitted as its current value: the default is submitted instead. */
  excluded?: boolean
}

/**
 * A non-visual `<input type="hidden">` carrying a `string` path into native `FormData` (§7.2
 * `hidden`) — the only markup `@mitcsutt/kiln-forms` renders itself. Nothing renders in view mode.
 */
export const FormHiddenField = defineField<string>()(function FormHiddenField({
  excluded,
}: FormHiddenFieldProps) {
  const binding = useFieldBinding<string>({ excluded, accepts: accepts.string, empty: '' })
  if (binding.mode === 'view') return null
  return (
    <input
      type="hidden"
      id={binding.id}
      name={binding.name}
      data-field={binding.name}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the accepts guard lets null through, and an untyped schema's missing default reads as undefined
      value={binding.value ?? ''}
    />
  )
})
