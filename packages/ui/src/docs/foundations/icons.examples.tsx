import * as Kiln from '@mitcsutt/kiln-ui'
import { Code, Grid, Stack } from '@mitcsutt/kiln-ui'

const icons = Object.entries(Kiln).filter(
  ([name, value]) => name.endsWith('Icon') && typeof value === 'object',
) as [string, typeof Kiln.CheckIcon][]

export function Usage() {
  return (
    <Grid minItemWidth="xs" gap={4}>
      {icons.map(([name, Icon]) => (
        <Stack key={name} gap={2} align="start">
          <Icon size="lg" />
          <Code>{name}</Code>
        </Stack>
      ))}
    </Grid>
  )
}
