import { useContext, useId, type ReactNode } from 'react'
import type { AnyFormApi } from '@tanstack/react-form'
import { Button, Heading, Inline, Stack } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'
import { FieldPresentation } from '#components/fields/FieldPresentation'
import { formContext } from '#kit/contexts'
import { getFormRuntime } from '#runtime/formRuntime'
import { defaultMessages } from '#runtime/messages'
import { useOptionalFormSteps } from '#components/layouts/FormSteps/useFormSteps'
import type { HeadingLevel } from '#components/layouts/internal/types'

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

/**
 * The same fields, rendered as a list of answers to check. For the last step of a wizard.
 *
 * @remarks
 * `FormReview` renders the fields inside it in view mode: a description list of labels and
 * formatted values. Reuse the JSX (or schema subtree) of earlier steps to build a "check your
 * answers" step.
 *
 * @example In a schema
 * ```json
 * { "layout": "review", "title": "Your booking", "children": [] }
 * ```
 */
export function FormReview(props: FormReviewProps) {
  return (
    <FieldViewListBoundary>
      <FormReviewInner {...props} />
    </FieldViewListBoundary>
  )
}
