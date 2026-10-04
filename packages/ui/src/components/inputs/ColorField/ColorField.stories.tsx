import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { ColorField } from './ColorField'

const TEAM_COLOURS = [
  { value: '#e5664f', label: 'Coral' },
  { value: '#d9a521', label: 'Gold' },
  { value: '#1f8f84', label: 'Teal' },
  { value: '#5b2a4e', label: 'Aubergine' },
]

const meta = {
  title: 'UI/Inputs/ColorField',
  component: ColorField,
  args: {
    label: 'Team colour',
    description: 'Shown beside the team on the fixture list',
    swatches: TEAM_COLOURS,
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
    error: 'Pick a colour for the Harbour Hawks',
  },
}
