import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { RangeSliderField } from './RangeSliderField'

const meta = {
  title: 'UI/Inputs/RangeSliderField',
  component: RangeSliderField,
  args: {
    label: 'Budget range',
    description: 'Monthly rent you could manage',
    name: 'budget',
    min: 500,
    max: 5000,
    step: 100,
    defaultValue: [1200, 2400],
    showValue: true,
    formatOptions: { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 },
    locale: 'en-GB',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <RangeSliderField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof RangeSliderField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = { args: { error: 'The range is wider than any listing we have' } }
