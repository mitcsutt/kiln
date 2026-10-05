import type { Meta, StoryObj } from '@storybook/react-vite'
import { RangeSlider } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const pounds: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
}

const meta = {
  title: 'UI/Inputs/RangeSlider',
  component: RangeSlider,
  args: {
    'aria-label': 'Price range',
    min: 500,
    max: 5000,
    step: 100,
    defaultValue: [1200, 3000],
    showValue: true,
    formatOptions: pounds,
    locale: 'en-GB',
    size: 'md',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <RangeSlider {...args} />
    </Stack>
  ),
} satisfies Meta<typeof RangeSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** £500–£5,000, with the ends and the midpoint marked. */
export const PriceRange: Story = {
  args: {
    marks: [
      { value: 500, label: '£500' },
      { value: 2700, label: '£2,700' },
      { value: 5000, label: '£5,000' },
    ],
  },
}

export const MeetingWindow: Story = {
  args: {
    'aria-label': 'Meeting window',
    min: 12,
    max: 22,
    step: 1,
    defaultValue: [15, 20],
    minStepsBetweenThumbs: 1,
    thumbLabels: ['Earliest start', 'Latest start'],
    formatOptions: { style: 'unit', unit: 'hour' },
  },
}

export const Invalid: Story = { args: { invalid: true } }

/**
 * A departure window between 05:00 and 23:00, at least an hour wide.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <RangeSlider
        aria-label="Departure window"
        defaultValue={[7, 10]}
        min={5}
        max={23}
        minStepsBetweenThumbs={1}
        thumbLabels={['Earliest departure', 'Latest departure']}
        showValue
        formatOptions={{ style: 'unit', unit: 'hour' }}
      />
    )
  },
}
