import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColorField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const LABEL_COLOURS = [
  { value: '#e5664f', label: 'Coral' },
  { value: '#d9a521', label: 'Gold' },
  { value: '#1f8f84', label: 'Teal' },
  { value: '#5b2a4e', label: 'Aubergine' },
]

const meta = {
  title: 'UI/Inputs/ColorField',
  component: ColorField,
  args: {
    label: 'Label colour',
    description: 'Shown beside the label on every task',
    swatches: LABEL_COLOURS,
    defaultValue: '#e5664f',
    required: false,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '22rem' }}>
      <ColorField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof ColorField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const SwatchesOnly: Story = {
  args: { swatchesOnly: true, defaultValue: '#5b2a4e' },
}

export const WithError: Story = {
  args: {
    defaultValue: undefined,
    swatchesOnly: true,
    required: true,
    error: 'Pick a colour for the Design label',
  },
}

/**
 * Named presets (`swatches`) are easier to choose between than a free picker, and each has a name
 * screen readers can say.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <ColorField
        label="Line colour"
        description="Used on the map and in the timetable"
        defaultValue="#1f6f8b"
        swatches={[
          { value: '#1f6f8b', label: 'Harbour blue' },
          { value: '#2e8b57', label: 'Coastal green' },
          { value: '#c4553d', label: 'Signal red' },
        ]}
      />
    )
  },
}
