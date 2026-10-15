import { ChartFrame } from '@mitcsutt/kiln-charts'
import { Button, Grid } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Charts/Building blocks/ChartFrame',
  component: ChartFrame,
  args: {
    label: 'Bookings by hour',
    summary: 'Bookings peak at noon and again at 6pm.',
    height: 200,
    status: 'ready',
  },
} satisfies Meta<typeof ChartFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * Draw your own chart in a frame: pass a function and it gets the plot's measured size, in the
 * browser only. The frame gives it a name, a summary, the data as a hidden table and a reserved
 * height.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <ChartFrame
      label="Bookings by hour"
      summary="Bookings peak at noon and again at 6pm."
      table={{
        columns: ['Hour', 'Bookings'],
        rows: [
          ['9am', '12'],
          ['Noon', '40'],
          ['3pm', '18'],
          ['6pm', '33'],
        ],
      }}
      height={160}
    >
      {({ width, height }) => (
        <svg width={width} height={height} aria-hidden>
          {[12, 40, 18, 33].map((value, index) => (
            <rect
              key={value}
              x={(index * width) / 4 + 8}
              width={width / 4 - 16}
              y={height - (value / 40) * height}
              height={(value / 40) * height}
              fill="var(--color-cat-2)"
              stroke="var(--color-cat-2-stroke)"
            />
          ))}
        </svg>
      )}
    </ChartFrame>
  ),
}

/** Loading, empty and error states keep the frame's size and say what's happening. */
export const States: Story = {
  tags: ['docs'],
  render: () => (
    <Grid columns={{ base: 1, md: 3 }} gap={5}>
      <ChartFrame label="Bookings by hour" status="loading" height={160} />
      <ChartFrame
        label="Cancellations by hour"
        status="empty"
        emptyMessage="No cancellations today"
        height={160}
      />
      <ChartFrame
        label="Walk-ins by hour"
        status="error"
        errorMessage="Walk-ins didn’t load"
        action={<Button size="sm">Try again</Button>}
        height={160}
      />
    </Grid>
  ),
}
