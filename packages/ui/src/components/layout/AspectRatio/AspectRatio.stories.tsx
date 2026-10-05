import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid } from '#components/layout/Grid'
import { Stack } from '#components/layout/Stack'
import { Artwork, Label } from '#components/layout/_story/StoryKit'
import { AspectRatio } from './AspectRatio'

const meta = {
  title: 'UI/Layout/AspectRatio',
  component: AspectRatio,
  args: { ratio: '16/9' },
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <AspectRatio {...args}>
      <Artwork kind="board" label="Task board" />
    </AspectRatio>
  ),
}

/** Every preset. The child always fills and crops; it never stretches. */
export const Presets: Story = {
  render: () => (
    <Grid minItemWidth="xs" gap={5} rowGap={6} align="end">
      {(['1/1', '4/3', '3/2', '16/9', '21/9', '3/4'] as const).map((ratio) => (
        <Stack key={ratio} gap={2}>
          <AspectRatio ratio={ratio}>
            <Artwork kind="screen" label={`Screen at ${ratio}`} />
          </AspectRatio>
          <Label>{ratio}</Label>
        </Stack>
      ))}
    </Grid>
  ),
}
