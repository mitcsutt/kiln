import {
  FormActions,
  ResetButton,
  useFormContext,
  useFormStatus,
  useSelector,
} from '@mitcsutt/kiln-forms'
import { Text } from '@mitcsutt/kiln-ui'

/** The foot of the settings form, reading the form from context rather than from a prop. */
export function SaveFooter() {
  const form = useFormContext()
  const { isDirty, isSubmitting } = useFormStatus()
  // One primitive from the store, so this re-renders only when the count changes.
  const saves = useSelector(form.store, (state) => state.submissionAttempts)
  return (
    <FormActions align="between">
      <Text size="sm" tone="muted">
        {isSubmitting
          ? 'Saving…'
          : isDirty
            ? 'Not saved yet'
            : saves > 0
              ? `Everything is saved (${String(saves)} saves this visit)`
              : 'Everything is saved'}
      </Text>
      <ResetButton>Undo unsaved changes</ResetButton>
    </FormActions>
  )
}
