import type { Meta, StoryObj } from '@storybook/react-vite'
import { AspectRatio, Grid } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'
import { Artwork, Label } from '#components/layout/_story/StoryKit'

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

function Chart({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 90" role="img" aria-label={label}>
      <rect width="160" height="90" fill="var(--color-surface-sunken)" />
      <path
        d="M0 70 L40 52 L80 60 L120 28 L160 36"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="3"
      />
    </svg>
  )
}

/**
 * The same chart framed at 16/9, 4/3 and 1/1.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Grid columns={{ base: 1, sm: 3 }} gap={4}>
        {(['16/9', '4/3', '1/1'] as const).map((ratio) => (
          <AspectRatio key={ratio} ratio={ratio}>
            <Chart label={`Passengers per hour, framed ${ratio}`} />
          </AspectRatio>
        ))}
      </Grid>
    )
  },
}
