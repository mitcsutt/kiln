import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColorInput, Stack } from '@mitcsutt/kiln-ui'

const LABEL_COLOURS = [
  { value: '#e5664f', label: 'Coral' },
  { value: '#d9a521', label: 'Gold' },
  { value: '#1f8f84', label: 'Teal' },
  { value: '#5b2a4e', label: 'Aubergine' },
]

const meta = {
  title: 'UI/Inputs/ColorInput',
  component: ColorInput,
  args: {
    'aria-label': 'Label colour',
    defaultValue: '#1f8f84',
    size: 'md',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '20rem' }}>
      <ColorInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof ColorInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Empty: Story = {
  args: { defaultValue: undefined },
}

export const WithSwatches: Story = {
  args: { swatches: LABEL_COLOURS },
}

export const SwatchesOnly: Story = {
  args: { swatches: LABEL_COLOURS, swatchesOnly: true, defaultValue: '#d9a521' },
}

const LINE_COLOURS = [
  { value: '#1f6f8b', label: 'Harbour blue' },
  { value: '#2e8b57', label: 'Coastal green' },
  { value: '#c4553d', label: 'Signal red' },
  { value: '#d9a21b', label: 'Market gold' },
]

/**
 * A line colour from the picker, the hex code or a swatch, and the same input limited to its
 * swatches.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        <ColorInput aria-label="Line colour" defaultValue="#1f6f8b" swatches={LINE_COLOURS} />
        <ColorInput
          aria-label="Line colour"
          defaultValue="#2e8b57"
          swatches={LINE_COLOURS}
          swatchesOnly
        />
      </Stack>
    )
  },
}
