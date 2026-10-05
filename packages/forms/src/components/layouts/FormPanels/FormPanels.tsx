import { useId, type ReactNode } from 'react'
import { Card, Grid, Inline, Stack, type Responsive, type Space } from '@mitcsutt/kiln-ui'
import { FieldViewListBoundary } from '#components/fields/FieldView'
import type { HeadingLevel } from '#components/layouts/internal/types'

export interface FormPanelsProps {
  /** Default `1`. */
  columns?: Responsive<1 | 2 | 3>
  /** Default `5`. */
  gap?: Responsive<Space>
  children: ReactNode
}

export interface FormPanelProps {
  title: ReactNode
  description?: ReactNode
  /** Default 3. */
  headingLevel?: HeadingLevel
  /** Buttons beside the title ("Remove card"). */
  actions?: ReactNode
  children: ReactNode
}

/** A grid of outlined panels (§9.5) — for self-contained objects (a payment method, an address). */
function FormPanelsRootInner({ columns = 1, gap = 5, children }: FormPanelsProps) {
  return (
    <Grid columns={columns} gap={gap}>
      {children}
    </Grid>
  )
}

/** One panel: `section aria-labelledby` inside an outline `Card`. */
export function FormPanel({
  title,
  description,
  headingLevel = 3,
  actions,
  children,
}: FormPanelProps) {
  const headingId = useId()
  return (
    <Card variant="outline" asChild>
      <section aria-labelledby={headingId}>
        <Card.Header>
          <Inline justify="between" align="center" gap={3}>
            <Card.Title level={headingLevel} id={headingId}>
              {title}
            </Card.Title>
            {actions}
          </Inline>
          {description != null ? <Card.Description>{description}</Card.Description> : null}
        </Card.Header>
        <Card.Body>
          <Stack gap={5}>{children}</Stack>
        </Card.Body>
      </section>
    </Card>
  )
}

function FormPanelsRoot(props: FormPanelsProps) {
  return (
    <FieldViewListBoundary>
      <FormPanelsRootInner {...props} />
    </FieldViewListBoundary>
  )
}

export const FormPanels = Object.assign(FormPanelsRoot, { Panel: FormPanel })
