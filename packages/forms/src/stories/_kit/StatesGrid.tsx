import type { ReactNode } from 'react'
import { Grid, Stack, Text } from '@mitcsutt/kiln-ui'

export interface StateCell {
  /** The state's name, shown as a small caption above it ("Error", "Disabled", …). */
  title: string
  children: ReactNode
}

/**
 * Story kit helper: lays out a field's named states (default, error, warning,
 * disabled, read-only, validating…) as a labelled grid, for the one "States" story every field
 * has.
 */
export function StatesGrid({ cells }: { cells: readonly StateCell[] }) {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={7}>
      {cells.map((cell) => (
        <Stack key={cell.title} gap={2}>
          <Text size="sm" tone="muted" weight="medium">
            {cell.title}
          </Text>
          {cell.children}
        </Stack>
      ))}
    </Grid>
  )
}
