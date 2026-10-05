import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChipGroupField } from './ChipGroupField'

const alerts = [
  { value: 'failed-build', label: 'Failed builds' },
  { value: 'rollback', label: 'Rollbacks' },
  { value: 'latency', label: 'Slow responses' },
  { value: 'certificates', label: 'Expiring certificates' },
]

const meta = {
  title: 'UI/Inputs/ChipGroupField',
  component: ChipGroupField,
  args: {
    type: 'multiple',
    label: 'Deploy alerts',
    description: 'Sent to your phone while a deploy runs',
    options: alerts,
    name: 'alerts',
    defaultValue: ['failed-build'],
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
    defaultValue: 'latency',
    description: undefined,
  },
}
