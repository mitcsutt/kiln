import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChipGroupField } from './ChipGroupField'

const alerts = [
  { value: 'goals', label: 'Goals' },
  { value: 'first-red', label: 'Red cards' },
  { value: 'own-goal', label: 'Own goal' },
  { value: 'penalties', label: 'Penalty shoot-outs' },
]

const meta = {
  title: 'UI/Inputs/ChipGroupField',
  component: ChipGroupField,
  args: {
    type: 'multiple',
    label: 'Match alerts',
    description: 'Sent to your phone during the match',
    options: alerts,
    name: 'alerts',
    defaultValue: ['goals'],
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof ChipGroupField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = { args: { defaultValue: [], error: 'Pick at least one alert' } }

export const Single: Story = {
  args: {
    type: 'single',
    label: 'Most important',
    defaultValue: 'own-goal',
    description: undefined,
  },
}
