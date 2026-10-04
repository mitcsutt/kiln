import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { ColorInput } from './ColorInput'

const TEAM_COLOURS = [
  { value: '#e5664f', label: 'Coral' },
  { value: '#d9a521', label: 'Gold' },
  { value: '#1f8f84', label: 'Teal' },
  { value: '#5b2a4e', label: 'Aubergine' },
]

const meta = {
  title: 'UI/Inputs/ColorInput',
  component: ColorInput,
  args: {
    'aria-label': 'Team colour',
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
  args: { swatches: TEAM_COLOURS },
}

export const SwatchesOnly: Story = {
  args: { swatches: TEAM_COLOURS, swatchesOnly: true, defaultValue: '#d9a521' },
}
