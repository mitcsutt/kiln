import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Slider } from './Slider'

const meta = {
  title: 'UI/Inputs/Slider',
  component: Slider,
  args: {
    'aria-label': 'Savings rate',
    defaultValue: 20,
    min: 0,
    max: 50,
    step: 5,
    showValue: true,
    formatOptions: { style: 'unit', unit: 'percent' },
    size: 'md',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <Slider {...args} />
    </Stack>
  ),
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Marks label the stops; a thumb on a mark reads the mark's label to screen readers. */
export const WithMarks: Story = {
  args: {
    'aria-label': 'Weekly grocery budget',
    min: 100,
    max: 300,
    step: 10,
    defaultValue: 180,
    formatOptions: { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 },
    marks: [
      { value: 100, label: '$100' },
      { value: 200, label: '$200' },
      { value: 300, label: '$300' },
    ],
  },
}

export const Small: Story = { args: { size: 'sm' } }

export const Invalid: Story = { args: { invalid: true, defaultValue: 45 } }

export const Disabled: Story = { args: { disabled: true } }
