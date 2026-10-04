import { useContext, useId, type ReactNode } from 'react'
import type { AnyFormApi } from '@tanstack/react-form'
import { Button, Heading, Inline, Stack } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#core/binding/FieldView'
import { FieldPresentation } from '#core/binding/presentation'
import { formContext } from '#core/contexts'
import { getFormRuntime } from '#core/runtime/formRuntime'
import { defaultMessages } from '#core/runtime/messages'
import { useOptionalFormSteps } from '#layouts/FormSteps/useFormSteps'
import type { HeadingLevel } from '#layouts/internal/types'

export interface FormReviewProps {
  title?: ReactNode
  /** Default 3. */
  headingLevel?: HeadingLevel
  /**
   * The wizard step this block reviews. With it, an Edit button calls `onEdit(step)` — or, inside
   * `FormSteps` without `onEdit`, goes back to that step.
   */
  step?: string
  onEdit?: (step: string) => void
  /**
   * The Edit button's text. Default `messages.edit` ("Edit"); with a `title`, the button is also
   * described by it, so several Edit buttons stay distinguishable.
   */
  editLabel?: string
  children: ReactNode
}

/**
 * Read-only review (§9.11): the same field JSX (and layouts) render read-only
 * (`FieldPresentation mode="view"`): each field is a label → formatted value `DataList`, so the
 * markup stays valid with sections, grids or tabs inside. View-mode fields never register for
 * focus or scopes, so a review step can repeat earlier steps' fields safely.
 */
function FormReviewInner({
  title,
  headingLevel = 3,
  step,
  onEdit,
  editLabel,
  children,
}: FormReviewProps) {
  const steps = useOptionalFormSteps()
  // Fields carry their form, so a FormReview may sit outside <Form>: fall back to the defaults.
  const form = useContext(formContext) as AnyFormApi | null
  const messages = form ? getFormRuntime(form).options.messages : defaultMessages
  const headingId = useId()
  const edit =
    step === undefined
      ? undefined
      : onEdit
        ? () => {
            onEdit(step)
          }
        : steps
          ? () => void steps.goTo(step)
          : undefined
  const editButton = edit ? (
    <Button
      variant="ghost"
      tone="neutral"
      size="sm"
      aria-describedby={title != null ? headingId : undefined}
      onClick={edit}
    >
      {editLabel ?? messages.edit}
    </Button>
  ) : null
  return (
    <FieldPresentation mode="view">
      <Stack gap={3}>
        {title != null || editButton ? (
          <Inline justify={title != null ? 'between' : 'end'} align="center" gap={3}>
            {title != null ? (
              <Heading level={headingLevel} id={headingId}>
                {title}
              </Heading>
            ) : null}
            {editButton}
          </Inline>
        ) : null}
        {children}
      </Stack>
    </FieldPresentation>
  )
}

export function FormReview(props: FormReviewProps) {
  return (
    <FieldViewListBoundary>
      <FormReviewInner {...props} />
    </FieldViewListBoundary>
  )
}
