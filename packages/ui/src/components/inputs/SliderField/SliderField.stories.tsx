import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { SliderField } from './SliderField'

const meta = {
  title: 'UI/Inputs/SliderField',
  component: SliderField,
  args: {
    label: 'Savings rate',
    description: 'Moved to savings on each pay day',
    name: 'savingsRate',
    defaultValue: 20,
    max: 50,
    step: 5,
    showValue: true,
    formatOptions: { style: 'unit', unit: 'percent' },
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '32rem' }}>
      <SliderField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof SliderField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithWarning: Story = {
  args: { defaultValue: 45, warning: 'That leaves $210 a fortnight for bills' },
}

export const WithError: Story = {
  args: { defaultValue: 50, error: 'Keep at least half your pay for bills' },
}

export const Horizontal: Story = { args: { layout: 'horizontal' } }
