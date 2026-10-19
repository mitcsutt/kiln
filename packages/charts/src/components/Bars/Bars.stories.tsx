import { Bars } from '@mitcsutt/kiln-charts'
import type { Meta, StoryObj } from '@storybook/react-vite'

const REGIONS = [
  { region: 'Harbour', online: 420, store: 310 },
  { region: 'Quay', online: 380, store: 120 },
  { region: 'Northgate', online: 290, store: 260 },
  { region: 'Riverside', online: 210, store: 190 },
]

const meta = {
  title: 'Charts/Presets/Bars',
  component: Bars,
  args: { data: REGIONS, x: 'region', label: 'Orders by region and channel, May', height: 260 },
} satisfies Meta<typeof Bars>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** One group of bars per row, a series per numeric key, named with `series`. */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <Bars
      data={[
        { region: 'Harbour', online: 420, store: 310 },
        { region: 'Quay', online: 380, store: 120 },
        { region: 'Northgate', online: 290, store: 260 },
        { region: 'Riverside', online: 210, store: 190 },
      ]}
      x="region"
      series={[
        { key: 'online', label: 'Online' },
        { key: 'store', label: 'In store' },
      ]}
      label="Orders by region and channel, May"
      height={260}
    />
  ),
}

/** `stacked` adds the series up into one bar per row; `target` marks a goal. */
export const Stacked: Story = {
  tags: ['docs'],
  render: () => (
    <Bars
      data={[
        { month: 'Jan', billable: 128, internal: 34 },
        { month: 'Feb', billable: 141, internal: 22 },
        { month: 'Mar', billable: 119, internal: 41 },
        { month: 'Apr', billable: 150, internal: 18 },
      ]}
      x="month"
      stacked
      target={{ value: 160, label: 'Capacity' }}
      label="Hours logged by month"
      height={260}
    />
  ),
}

/**
 * `layout="vertical"` lays the bars across, for long category names. `stacked="percent"` shows
 * each part's share of its row.
 */
export const Shares: Story = {
  name: 'Shares, sideways',
  tags: ['docs'],
  render: () => (
    <Bars
      data={[
        { plan: 'Studio, billed yearly', renewed: 182, lapsed: 21 },
        { plan: 'Studio, billed monthly', renewed: 240, lapsed: 66 },
        { plan: 'Team, billed yearly', renewed: 96, lapsed: 4 },
      ]}
      x="plan"
      layout="vertical"
      stacked="percent"
      series={[
        { key: 'renewed', color: 'positive' },
        { key: 'lapsed', color: 'neutral' },
      ]}
      label="Renewals by plan"
      height={220}
    />
  ),
}
