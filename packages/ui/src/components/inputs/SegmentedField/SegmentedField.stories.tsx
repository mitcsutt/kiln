import type { Meta, StoryObj } from '@storybook/react-vite'
import { SegmentedField } from './SegmentedField'

const periods = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

const meta = {
  title: 'UI/Inputs/SegmentedField',
  component: SegmentedField,
  args: {
    label: 'Budget period',
    description: 'Totals reset at the start of each',
    options: periods,
    name: 'period',
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof SegmentedField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Label and help in one column, the control in the other (stacks below `sm`). */
export const Horizontal: Story = { args: { layout: 'horizontal' } }

export const WithError: Story = { args: { error: 'Pick a period to compare against' } }

export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'quarter' } }
