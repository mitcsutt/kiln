import { ChartTooltip } from '@mitcsutt/kiln-charts'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Charts/Building blocks/ChartTooltip',
  component: ChartTooltip,
  args: {
    title: 'Thursday 5 March',
    items: [
      { label: 'Sign-ups', value: '63', color: 'cat-1', shape: 'line' },
      { label: 'Started a trial', value: '27', color: 'cat-2', shape: 'line' },
    ],
  },
} satisfies Meta<typeof ChartTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** The card every chart shows for a point: a heading and a row per series, values aligned. */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <ChartTooltip
      title="March 2026"
      items={[
        { label: 'Revenue', value: '$19,800', color: 'cat-1' },
        { label: 'Target', value: '$21,000', color: 'neutral', shape: 'dashed' },
        { label: 'Refunds', value: '$1,240', color: 'critical' },
      ]}
    />
  ),
}
