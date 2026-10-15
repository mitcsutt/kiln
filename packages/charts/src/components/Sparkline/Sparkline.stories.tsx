import { Sparkline } from '@mitcsutt/kiln-charts'
import { Grid, Stat, Stack } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Charts/Presets/Sparkline',
  component: Sparkline,
  args: { data: [12, 18, 15, 22, 19, 27, 31, 28, 35], label: 'Orders, last 9 days', height: 40 },
} satisfies Meta<typeof Sparkline>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Beside a figure, a sparkline shows where it's heading. Plain numbers are enough. */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <Grid columns={{ base: 1, sm: 3 }} gap={6}>
      <Stack gap={2}>
        <Stat label="Orders" value="1,284" />
        <Sparkline data={[12, 18, 15, 22, 19, 27, 31, 28, 35]} label="Orders, last 9 days" />
      </Stack>
      <Stack gap={2}>
        <Stat label="Returns" value="38" />
        <Sparkline
          data={[6, 4, 5, 3, 4, 2, 3]}
          label="Returns, last 7 days"
          variant="area"
          color="cat-4"
        />
      </Stack>
      <Stack gap={2}>
        <Stat label="Net new seats" value="+14" />
        <Sparkline
          data={[3, -1, 4, 2, -2, 5, 3]}
          label="Net new seats by day"
          variant="bar"
          color="seq-5"
        />
      </Stack>
    </Grid>
  ),
}

/** Rows with dates give the hidden table and the summary readable x values. */
export const WithDates: Story = {
  name: 'Rows with dates',
  tags: ['docs'],
  render: () => (
    <Sparkline
      data={[
        { day: '2026-03-02', latency: 182 },
        { day: '2026-03-03', latency: 176 },
        { day: '2026-03-04', latency: null },
        { day: '2026-03-05', latency: 214 },
        { day: '2026-03-06', latency: 190 },
      ]}
      x="day"
      label="Median response time, ms"
      height={48}
    />
  ),
}
