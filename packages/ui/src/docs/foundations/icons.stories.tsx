import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Kiln from '@mitcsutt/kiln-ui'
import { Code, Grid, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Foundations/Icons',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const icons = Object.entries(Kiln).filter(
  ([name, value]) => name.endsWith('Icon') && typeof value === 'object',
) as [string, typeof Kiln.CheckIcon][]

/**
 * Every icon Kiln ships, at the `lg` size, with its name.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
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
  },
}
