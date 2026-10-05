import type { Meta, StoryObj } from '@storybook/react-vite'
import { Slider, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/Slider',
  component: Slider,
  args: {
    'aria-label': 'Discount rate',
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
    'aria-label': 'Hourly rate',
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

/**
 * `marks` labels points under the track, and a mark's label becomes the thumb's spoken value when
 * it lands there. `showValue` prints the value, formatted with `formatOptions`. `onValueCommit`
 * fires when the drag ends, for work you don't want to do on every move.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={6}>
        <Slider
          aria-label="Walking distance"
          defaultValue={800}
          min={0}
          max={2000}
          step={100}
          showValue
          formatOptions={{ style: 'unit', unit: 'meter' }}
        />
        <Slider
          aria-label="Seats"
          defaultValue={2}
          min={1}
          max={6}
          marks={[1, 2, 3, 4, 5, 6].map((value) => ({ value, label: String(value) }))}
          size="sm"
        />
      </Stack>
    )
  },
}
