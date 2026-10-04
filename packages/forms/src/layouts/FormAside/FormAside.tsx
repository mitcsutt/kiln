import { useId, type ReactNode } from 'react'
import { Heading, Split, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#core/binding/FieldView'
import type { HeadingLevel } from '#layouts/internal/types'

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

export function FormAside(props: FormAsideProps) {
  return (
    <FieldViewListBoundary>
      <FormAsideInner {...props} />
    </FieldViewListBoundary>
  )
}
