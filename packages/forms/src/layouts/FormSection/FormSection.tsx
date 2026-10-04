import { useId, type ReactNode } from 'react'
import {
  Fieldset,
  Heading,
  Stack,
  Text,
  VisuallyHidden,
  type Responsive,
  type Space,
} from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#core/binding/FieldView'
import { FieldPresentation } from '#core/binding/presentation'
import type { HeadingLevel } from '#layouts/internal/types'

export interface FormSectionProps {
  title: ReactNode
  description?: ReactNode
  /** Keeps the title for assistive tech but hides it visually. */
  titleHidden?: boolean
  /** `fieldset` (default): a group of related fields. `section`: a headed chapter. */
  as?: 'fieldset' | 'section'
  /** Heading level for `as="section"`. Default 3. */
  headingLevel?: HeadingLevel
  /** Disables every field inside (native fieldset cascade + presentation). */
  disabled?: boolean
  /** Makes every field inside read-only (presentation cascade). */
  readOnly?: boolean
  /** Default `5`. */
  gap?: Responsive<Space>
  children: ReactNode
}

/**
 * A titled group of fields (§9.2). `as="fieldset"` renders `fieldset/legend` (ui `Fieldset`
 * `variant="section"`); `as="section"` renders `section aria-labelledby` + a heading.
 * `disabled` / `readOnly` cascade to every field and cannot be undone by a nested field.
 */
function FormSectionInner({
  title,
  description,
  titleHidden = false,
  as = 'fieldset',
  headingLevel = 3,
  disabled,
  readOnly,
  gap = 5,
  children,
}: FormSectionProps) {
  const headingId = useId()
  const body = (
    <FieldPresentation disabled={disabled} readOnly={readOnly}>
      <Stack gap={gap}>{children}</Stack>
    </FieldPresentation>
  )

  if (as === 'section') {
    const heading = (
      <Heading level={headingLevel} id={headingId}>
        {title}
      </Heading>
    )
    return (
      <Stack as="section" gap={gap} aria-labelledby={headingId}>
        {titleHidden || description != null ? (
          <Stack gap={2}>
            {titleHidden ? <VisuallyHidden as="div">{heading}</VisuallyHidden> : heading}
            {description != null ? <Text tone="muted">{description}</Text> : null}
          </Stack>
        ) : (
          heading
        )}
        {body}
      </Stack>
    )
  }

  return (
    <Fieldset
      variant="section"
      legend={title}
      legendHidden={titleHidden}
      description={description}
      disabled={disabled}
    >
      {body}
    </Fieldset>
  )
}

export function FormSection(props: FormSectionProps) {
  return (
    <FieldViewListBoundary>
      <FormSectionInner {...props} />
    </FieldViewListBoundary>
  )
}
