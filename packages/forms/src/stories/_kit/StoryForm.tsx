import { useState, type ReactNode } from 'react'
import { CodeBlock, Stack } from '@mitcsutt/kiln-ui'
import { Form, ResetButton, SubmitButton } from '#components/form'
import { FormActions } from '#components/layouts'
import { kit } from '#kit/defaultKit'
import type { KitForm } from '#kit/types'

type DefaultForm<T> = KitForm<T, undefined, typeof kit.registries.fields>

export interface StoryFormProps<T> {
  /** Starting values for the demo form. */
  defaultValues: T
  /** Renders the fields; receives the live form so it can use `form.<Kind>Field`. */
  children: (form: DefaultForm<T>) => ReactNode
  /** Label for the submit button. Default "Submit". */
  submitLabel?: string
  /** Shows a reset button beside submit. Default `true`. */
  showReset?: boolean
  /** Accessible name for the `<form>` landmark. Default "Example". */
  label?: string
  /** `view` renders every field's display value instead of its control. */
  mode?: 'edit' | 'view'
  /** Hides the actions row (submit/reset) — for a bare view-mode demo. */
  hideActions?: boolean
  /** Hides the submitted-output panel below the form. */
  hideOutput?: boolean
}

/**
 * The story kit's form wrapper: builds a form with the default kit, renders it inside
 * `<Form>` with a submit/reset row, and shows the submitted `{ value, output }` as JSON in a
 * `CodeBlock` underneath — so a story doubles as a live demo of what actually gets submitted.
 */
export function StoryForm<T>({
  defaultValues,
  children,
  submitLabel = 'Submit',
  showReset = true,
  label = 'Example',
  mode,
  hideActions = false,
  hideOutput = false,
}: StoryFormProps<T>) {
  const [submitted, setSubmitted] = useState<{ value: T; output: unknown } | null>(null)
  const form = kit.useAppForm<T>({
    defaultValues,
    onSubmit: ({ value, output }) => {
      setSubmitted({ value, output })
    },
  })

  return (
    <Stack gap={5}>
      <Form form={form} aria-label={label} mode={mode}>
        <Stack gap={5}>
          {children(form)}
          {hideActions ? null : (
            <FormActions>
              {showReset ? <ResetButton>Reset</ResetButton> : null}
              <SubmitButton>{submitLabel}</SubmitButton>
            </FormActions>
          )}
        </Stack>
      </Form>
      {hideOutput ? null : (
        <CodeBlock
          title={submitted ? 'Submitted' : 'Not submitted yet'}
          language="JSON"
          copyable={false}
          code={JSON.stringify(
            submitted ?? { value: defaultValues, output: defaultValues },
            null,
            2,
          )}
        />
      )}
    </Stack>
  )
}
