import { useId, type ReactNode } from 'react'
import { Heading, Split, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'
import type { HeadingLevel } from '#components/layouts/internal/types'

export interface FormAsideProps {
  title: ReactNode
  /** The "why" — prose beside the fields. */
  description?: ReactNode
  /** Default 3. */
  headingLevel?: HeadingLevel
  /** Default `'4/8'`. */
  ratio?: '4/8' | '5/7' | '1/3'
  /** Stack the columns below this breakpoint. Default `'md'`. */
  collapseBelow?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

/**
 * The settings layout (§9.3): heading + description in a hang column, fields beside them.
 * `section aria-labelledby`; the field column is a `role="group"` named by the same heading.
 * Stack several with `<Stack dividers gap={8}>`.
 */
function FormAsideInner({
  title,
  description,
  headingLevel = 3,
  ratio = '4/8',
  collapseBelow = 'md',
  children,
}: FormAsideProps) {
  const headingId = useId()
  return (
    <Split
      as="section"
      ratio={ratio}
      collapseBelow={collapseBelow}
      gap={6}
      aria-labelledby={headingId}
    >
      <Stack gap={2}>
        <Heading level={headingLevel} id={headingId}>
          {title}
        </Heading>
        {description != null ? <Text tone="muted">{description}</Text> : null}
      </Stack>
      <Stack gap={5} role="group" aria-labelledby={headingId}>
        {children}
      </Stack>
    </Split>
  )
}

/**
 * The settings layout. A heading and its reason in a column beside the fields.
 *
 * @remarks
 * `FormAside` puts a section's heading and a sentence about why it matters in a column on the
 * left, and the fields on the right. Stack several with dividers for a settings page. Below
 * `collapseBelow` the column stacks above the fields.
 *
 * @example In a schema
 * ```json
 * {
 *   "layout": "aside",
 *   "title": "Profile",
 *   "description": "Shown to people you share routes with.",
 *   "children": []
 * }
 * ```
 */
export function FormAside(props: FormAsideProps) {
  return (
    <FieldViewListBoundary>
      <FormAsideInner {...props} />
    </FieldViewListBoundary>
  )
}
