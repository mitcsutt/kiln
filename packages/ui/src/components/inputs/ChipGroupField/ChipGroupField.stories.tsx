import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChipGroupField } from '@mitcsutt/kiln-ui'

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

/**
 * Chips suit short labels. For choices that need a sentence each, use a
 * [CheckboxGroupField](/docs/ui/inputs/checkbox-group-field).
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <ChipGroupField
        label="Days you travel"
        description="We'll tailor alerts to these days"
        type="multiple"
        defaultValue={['mon', 'wed']}
        options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
          value: day.toLowerCase(),
          label: day,
        }))}
      />
    )
  },
}
