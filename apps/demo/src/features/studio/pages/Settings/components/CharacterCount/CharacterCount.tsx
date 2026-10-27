import { useFieldContext } from '@mitcsutt/kiln-forms'
import { Text } from '@mitcsutt/kiln-ui'

/** Inside `form.AppField`: reads the field it sits in and counts what's been typed. */
export function CharacterCount({ max }: { max: number }) {
  const field = useFieldContext<string>()
  const length = field.state.value.length
  return (
    <Text size="xs" tone={length > max ? 'critical' : 'muted'} aria-live="polite">
      {length} of {max} characters
    </Text>
  )
}
