import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/NumberField',
  component: NumberField,
  args: {
    label: 'Guests',
    description: 'Including you',
    defaultValue: 2,
    min: 1,
    max: 12,
    required: false,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '20rem' }}>
      <NumberField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof NumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { defaultValue: 14, max: 14, error: 'The long table seats 12' },
}

export const Horizontal: Story = {
  args: {
    label: 'Nights',
    description: 'Check-in Friday 6 November',
    layout: 'horizontal',
    defaultValue: 3,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '36rem' }}>
      <NumberField {...args} />
    </Stack>
  ),
}

/**
 * The value is `number | null` (empty is `null`, not `0`). `clampOnBlur` pulls an out-of-range
 * value back inside when the reader leaves the field.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <NumberField
        label="Passengers"
        description="Children under five travel free and don't need a seat"
        defaultValue={2}
        min={1}
        max={9}
        stepper
      />
    )
  },
}
