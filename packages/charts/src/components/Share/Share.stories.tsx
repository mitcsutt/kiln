import { Share } from '@mitcsutt/kiln-charts'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Charts/Presets/Share',
  component: Share,
  args: {
    data: [{ search: 5200, email: 1800, social: 2400, referral: 600 }],
    label: 'Visits by channel, April',
    totalLabel: 'visits',
  },
} satisfies Meta<typeof Share>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** One wide row: each numeric key is a part. The legend gives every share and amount as text. */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <Share
      data={[{ search: 5200, email: 1800, social: 2400, referral: 600 }]}
      labels={{ search: 'Search', email: 'Email', social: 'Social', referral: 'Referral' }}
      label="Visits by channel, April"
      totalLabel="visits"
    />
  ),
}

/** Long rows with `pivot`. Past eight parts, the smallest group as a neutral "Other". */
export const ManyParts: Story = {
  name: 'Many parts',
  tags: ['docs'],
  render: () => (
    <Share
      data={[
        { category: 'Rent', spend: 2400 },
        { category: 'Payroll', spend: 9800 },
        { category: 'Software', spend: 1240 },
        { category: 'Travel', spend: 860 },
        { category: 'Equipment', spend: 1520 },
        { category: 'Training', spend: 430 },
        { category: 'Insurance', spend: 610 },
        { category: 'Utilities', spend: 380 },
        { category: 'Catering', spend: 220 },
        { category: 'Postage', spend: 90 },
      ]}
      pivot={{ by: 'category', value: 'spend' }}
      format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }}
      locale="en-GB"
      label="Spend by category, March"
      totalLabel="spent"
      height={240}
    />
  ),
}
