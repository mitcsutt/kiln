import { Heatmap } from '@mitcsutt/kiln-charts'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

const HOURS = ['08', '10', '12', '14', '16', '18', '20']
const ORDERS = [
  ['Mon', 4, 12, 30, 18, 14, 22, 9],
  ['Tue', 6, 15, 28, 20, 16, 25, 11],
  ['Wed', 5, 11, 33, 17, 12, 27, 13],
  ['Thu', 7, 14, 35, 22, 18, 31, 15],
  ['Fri', 9, 18, 41, 26, 24, 38, 21],
  ['Sat', 2, 21, 37, 30, 28, 19, 8],
].map(([day, ...counts]) => {
  const row: Record<string, unknown> = { day }
  HOURS.forEach((hour, i) => {
    row[hour] = counts[i]
  })
  return row
})

const meta = {
  title: 'Charts/Presets/Heatmap',
  component: Heatmap,
  args: { data: ORDERS, x: 'day', columns: HOURS, label: 'Orders by day and hour' },
} satisfies Meta<typeof Heatmap>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * Long rows with `pivot`, one per day and hour. Hours look like whole numbers, so `columns` sets
 * their order.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <Heatmap
      data={[
        { day: 'Mon', hour: '09', orders: 4 },
        { day: 'Mon', hour: '12', orders: 30 },
        { day: 'Mon', hour: '17', orders: 18 },
        { day: 'Tue', hour: '09', orders: 6 },
        { day: 'Tue', hour: '12', orders: 28 },
        { day: 'Tue', hour: '17', orders: 22 },
        { day: 'Wed', hour: '09', orders: 5 },
        { day: 'Wed', hour: '12', orders: 33 },
        { day: 'Wed', hour: '17', orders: 27 },
      ]}
      x="day"
      pivot={{ by: 'hour', value: 'orders' }}
      columns={['09', '12', '17']}
      columnLabels={{ '09': '9am', '12': 'Noon', '17': '5pm' }}
      label="Orders by day and hour"
    />
  ),
}

/** `scale="diverging"` colours either side of `midpoint`, here change against last week. */
export const Diverging: Story = {
  name: 'Change either side of zero',
  tags: ['docs'],
  render: () => (
    <Heatmap
      data={[
        { team: 'Platform', w14: 4, w15: -2, w16: 7, w17: 1 },
        { team: 'Payments', w14: -6, w15: -3, w16: 0, w17: 5 },
        { team: 'Mobile', w14: 2, w15: 8, w16: -4, w17: -7 },
      ]}
      x="team"
      columnLabels={{ w14: 'Wk 14', w15: 'Wk 15', w16: 'Wk 16', w17: 'Wk 17' }}
      scale="diverging"
      format={{ signDisplay: 'exceptZero' }}
      label="Change in open issues against the week before"
    />
  ),
}

/** Arrow keys move between cells and the tooltip shows each value. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getAllByRole('gridcell')[0]).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}')
    await expect(canvas.getAllByRole('gridcell')[8]).toHaveFocus()
    await expect(canvas.getByText('Tue, 10')).toBeVisible()
  },
}
